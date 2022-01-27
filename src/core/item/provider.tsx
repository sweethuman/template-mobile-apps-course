import React, { useCallback, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../index";
import { ItemProperties } from "./ItemProperties";
import { createItem, getAllItems, newWebSocket, updateItem } from "./api";
import { AuthContext } from "../auth/provider";
import { useImmerReducer } from "use-immer";
import { Draft } from "immer";
import { Storage } from "@capacitor/storage";
import { useNetwork } from "../useNetwork";
import axios from "axios";

const log = getLogger("ItemProvider");

type SaveAssignmentFunction = (item: ItemProperties) => Promise<any>;
type ResolveConflictFunction = (item: ItemProperties) => Promise<any>;
type GetConflictFunction = (id: string, version: string) => Promise<any>;
export let conflicts: string[] = [];

export interface ItemState {
  assignments?: ItemProperties[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveAssignment?: SaveAssignmentFunction;
  resolveConflict?: ResolveConflictFunction;
  getConflict?: GetConflictFunction;
}

enum ApiAction {
  SAVE_ITEM,
}

interface ApiActionCache extends Array<{ action: ApiAction; payload: any }> {}

enum ActionType {
  FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED",
  FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED",
  FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED",
  SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED",
  SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED",
  SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED",
  UPDATED_ITEM_ON_SERVER = "UPDATED_ITEM_ON_SERVER",
}

interface ActionProps {
  type: ActionType;
  payload?: any;
}

const initialState: ItemState = {
  fetching: false,
  saving: false,
};

const reducer: (draft: Draft<ItemState>, action: ActionProps) => ItemState = (state, { type, payload }) => {
  switch (type) {
    case ActionType.FETCH_ITEMS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case ActionType.FETCH_ITEMS_SUCCEEDED:
      return { ...state, assignments: payload.items, fetching: false };
    case ActionType.FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case ActionType.SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };
    case ActionType.SAVE_ITEM_SUCCEEDED:
      const items = [...(state.assignments || [])];
      const item = payload.assignment;
      const index = items.findIndex((it) => it.id === item.id);
      if (index === -1) {
        // TODO don't forget about this when websocket
        items.splice(0, 0, item);
      } else {
        items[index] = item;
      }
      return { ...state, assignments: items, saving: false };
    case ActionType.SAVE_ITEM_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    case ActionType.UPDATED_ITEM_ON_SERVER:
      const elems = [...(state.assignments || [])];
      const elem = payload.assignment;
      const ind = elems.findIndex((it) => it.id === elem.id);
      elems[ind] = elem;
      return { ...state, assignments: elems };
    default:
      return state;
  }
};

export const AssignmentContext = React.createContext<ItemState>(initialState);

interface AssignmentProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const ItemProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useImmerReducer<ItemState, ActionProps>(reducer, initialState);
  const { networkStatus } = useNetwork();
  const { assignments, fetching, fetchingError, saving, savingError } = state;
  const getLocalData = useCallback(async () => {
    let localAssignments = await Storage.keys().then((localStorageData) => {
      for (let i = 0; i < localStorageData.keys.length; i++)
        if (localStorageData.keys[i].valueOf().includes("assignments"))
          return Storage.get({ key: localStorageData.keys[i] });
    });
    dispatch({
      type: ActionType.FETCH_ITEMS_SUCCEEDED,
      payload: { items: JSON.parse(localAssignments?.value || "{}") },
    });
  }, [dispatch]);
  useEffect(getAssignmentsEffect, [dispatch, getLocalData, token]);
  useEffect(wsEffect, [dispatch, token]);

  const saveAssignment = useCallback<SaveAssignmentFunction>(saveAssignmentCallback, [dispatch, token]);
  // const [currentConflict, setCurrentConflict]=useState<ItemProperties>();
  const retryApiActions = useCallback(async () => {
    const { value } = await Storage.get({ key: "actionCache" });
    return;
    await Storage.set({ key: "actionCache", value: JSON.stringify([]) });
    const cache: ApiActionCache = JSON.parse(value!);
    for (let act of cache) {
      // TODO ADD WHATEVER NEW ACTIONS YOU NEED HERE
      switch (act.action) {
        case ApiAction.SAVE_ITEM:
          await saveAssignment(act.payload);
          break;
        default:
          console.error("Unknown action", act.action, act.payload);
      }
    }
  }, [networkStatus.connected, saveAssignment]);
  useEffect(() => {
    retryApiActions();
  }, [retryApiActions, networkStatus.connected]);
  log("returns");
  return (
    <AssignmentContext.Provider value={{ assignments, fetching, fetchingError, saving, savingError, saveAssignment }}>
      {children}
    </AssignmentContext.Provider>
  );

  function getAssignmentsEffect() {
    let canceled = false;
    fetchAssignments();
    return () => {
      canceled = true;
    };

    async function fetchAssignments() {
      if (!token?.trim()) {
        return;
      }
      try {
        log("fetchAssignments started");
        dispatch({ type: ActionType.FETCH_ITEMS_STARTED });
        let conf = await Storage.get({ key: "conflictingData" });
        conflicts = JSON.parse(conf.value || "[]");
        if (!conflicts || conflicts.length === 0) {
          const items = await getAllItems(token);
          log("fetchAssignments succeeded");
          if (!canceled) {
            dispatch({ type: ActionType.FETCH_ITEMS_SUCCEEDED, payload: { items } });
          }
        } else await getLocalData();
      } catch (error) {
        await getLocalData();
      }
      setPhotosToLocalStorage();
    }
  }

  function setPhotosToLocalStorage() {}

  async function cacheApiAction(action: ApiAction, payload: any) {
    const { value } = await Storage.get({ key: "actionCache" });
    const cache: ApiActionCache = JSON.parse(value || "[]");
    cache.push({ action, payload });
    await Storage.set({ key: "actionCache", value: JSON.stringify(cache) });
  }

  async function saveAssignmentCallback(assignment: ItemProperties) {
    try {
      log("saveItem started");
      dispatch({ type: ActionType.SAVE_ITEM_STARTED });
      const savedItem = await updateItem(token, assignment);
      log("saveItem succeeded");
      dispatch({ type: ActionType.SAVE_ITEM_SUCCEEDED, payload: { assignment: savedItem } });
    } catch (error) {
      // TODO ADD WHATEVER NEW ACTIONS YOU NEED HERE
      if (axios.isAxiosError(error)) {
        dispatch({
          type: ActionType.SAVE_ITEM_FAILED,
          payload: { error: new Error(error.response ? error.response.data.text : error.message) },
        });
      } else {
        dispatch({ type: ActionType.SAVE_ITEM_FAILED, payload: { error } });
      }
      getAssignmentsEffect();
      await cacheApiAction(ApiAction.SAVE_ITEM, assignment);
    }
  }

  function wsEffect() {
    let canceled = false;
    log("wsEffect - connecting");
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, (message) => {
        if (canceled) {
          return;
        }
        const { type, payload: assignment } = message;
        log(`ws message, item ${type}`);
        if (type === "created" || type === "updated") {
          dispatch({ type: ActionType.SAVE_ITEM_SUCCEEDED, payload: { assignment: assignment } });
        }
        // TODO don't forget about this one
        //dispatch({ type: ActionType.SAVE_ITEM_SUCCEEDED, payload: { assignment: message } });
      });
    }
    return () => {
      log("wsEffect - disconnecting");
      canceled = true;
      closeWebSocket?.();
    };
  }
};

import React, { useCallback, useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../index";
import { ItemProperties } from "./ItemProperties";
import { getAllItems, newWebSocket } from "./api";
import { AuthContext } from "../auth/provider";
import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;
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

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: ItemState = {
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";
const UPDATED_ITEM_ON_SERVER = "UPDATED_ITEM_ON_SERVER";

const reducer: (state: ItemState, action: ActionProps) => ItemState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_ITEMS_STARTED:
      return { ...state, fetching: true, fetchingError: null };
    case FETCH_ITEMS_SUCCEEDED:
      return { ...state, assignments: payload.items, fetching: false };
    case FETCH_ITEMS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_ITEM_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_ITEM_SUCCEEDED:
      const items = [...(state.assignments || [])];
      const item = payload.assignment;
      const index = items.findIndex((it) => it._id === item._id);
      if (index === -1) {
        items.splice(0, 0, item);
      } else {
        items[index] = item;
      }
      return { ...state, assignments: items, saving: false };
    case SAVE_ITEM_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    case UPDATED_ITEM_ON_SERVER:
      const elems = [...(state.assignments || [])];
      const elem = payload.assignment;
      const ind = elems.findIndex((it) => it._id === elem._id);
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const { assignments, fetching, fetchingError, saving, savingError } = state;
  useEffect(getAssignmentsEffect, [token]);
  useEffect(wsEffect, [token]);

  const saveAssignment = useCallback<SaveAssignmentFunction>(saveAssignmentCallback, [token]);
  // const [currentConflict, setCurrentConflict]=useState<ItemProperties>();
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
        dispatch({ type: FETCH_ITEMS_STARTED });
        let conf = await Storage.get({ key: "conflictingData" });
        conflicts = JSON.parse(conf.value || "[]");
        if (!conflicts || conflicts.length === 0) {
          const items = await getAllItems(token);
          log("fetchAssignments succeeded");
          if (!canceled) {
            dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
          }
        } else await getLocalData();
      } catch (error) {
        await getLocalData();
      }
      setPhotosToLocalStorage();
    }
  }

  function setPhotosToLocalStorage() {}

  async function getLocalData() {
    let localAssignments = await Storage.keys().then(function (localStorageData: { keys: string | any[] }) {
      for (let i = 0; i < localStorageData.keys.length; i++)
        if (localStorageData.keys[i].valueOf().includes("assignments"))
          return Storage.get({ key: localStorageData.keys[i] });
    });
    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: JSON.parse(localAssignments?.value || "{}") } });
  }

  async function saveAssignmentCallback(assignment: ItemProperties) {
    // try {
    //   log('saveItem started');
    //   dispatch({type: SAVE_ITEM_STARTED});
    //   const savedItem = await (assignment._id ? updateAssignment(token, assignment) :createItem(token, assignment));
    //   log('saveItem succeeded');
    //   dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {assignment: savedItem}});
    // } catch (error) {
    //   // await saveLocalData(assignment);
    // }
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
          dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { assignment: assignment } });
        }
      });
    }
    return () => {
      log("wsEffect - disconnecting");
      canceled = true;
      closeWebSocket?.();
    };
  }
};

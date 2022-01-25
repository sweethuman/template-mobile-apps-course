import axios from "axios";
import { authConfig, baseUrl, getLogger, withLogs } from "../index";
import { ItemProperties } from "./ItemProperties";
import { Storage } from "@capacitor/storage";

const assignmentUrl = `http://${baseUrl}/api/assignment`;

export const getAllItems: (token: string) => Promise<ItemProperties[]> = (token) => {
  let res = axios.get(assignmentUrl, authConfig(token));
  res.then(async function (res) {
    await Storage.set({
      key: `assignments`,
      value: JSON.stringify(res.data),
    });
  });
  return withLogs(res, "getAssignments");
};

export const updateItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
  // replace with whatever
  item.version = new Date().toUTCString();
  return withLogs(axios.patch(assignmentUrl, item, authConfig(token)), "updateItem");
};

export const createItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
  item.version = new Date().toUTCString();
  return withLogs(axios.post(assignmentUrl, item, authConfig(token)), "createItem");
};

interface MessageData {
  type: string;
  payload: ItemProperties;
}

const log = getLogger("ws");

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log("web socket onopen");
    ws.send(JSON.stringify({ type: "authorization", payload: { token } }));
  };
  ws.onclose = () => {
    log("web socket onclose");
  };
  ws.onerror = (error) => {
    log("web socket onerror", error);
  };
  ws.onmessage = (messageEvent) => {
    log("web socket onmessage " + messageEvent.data);
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};

import axios from "axios";
import { authConfig, baseUrl, getLogger, withLogs } from "../index";
import { ItemProperties } from "./ItemProperties";
import { Storage } from "@capacitor/storage";

const assignmentUrl = `http://${baseUrl}/question`;

export const getAllItems: (token: string, qustionIds: number[]) => Promise<ItemProperties[]> = async (
  token,
  qustionIds,
) => {
  const qqs: ItemProperties[] = [];
  for (let q of qustionIds) {
    let res = await withLogs(axios.get<ItemProperties>(assignmentUrl + "/" + q, authConfig(token)), "getAssignments");
    qqs.push(res);
  }
  await Storage.set({
    key: `assignments`,
    value: JSON.stringify(qqs),
  });
  return qqs;
};

export const getItem: (token: string, qId: number) => Promise<ItemProperties> = (token, qId) => {
  return withLogs(axios.get<ItemProperties>(assignmentUrl + "/" + qId, authConfig(token)), "getItem");
};

export const updateItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
  // replace with whatever
  return withLogs(axios.patch(assignmentUrl, item, authConfig(token)), "updateItem");
};

export const createItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
  return withLogs(axios.post(assignmentUrl, item, authConfig(token)), "createItem");
};

interface MessageData extends ItemProperties {}

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

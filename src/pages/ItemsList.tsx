import React, { useContext, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSelectOption,
  IonSelect,
  IonSearchbar,
  IonLabel,
  IonChip,
  IonAlert,
  IonToast,
  createAnimation,
  CreateAnimation,
} from "@ionic/react";
import { add, cloud, cloudOffline } from "ionicons/icons";
import Item from "../components/item/Item";
import { getLogger } from "../core";
import { AssignmentContext, conflicts } from "../core/item/provider";
import { AuthContext } from "../core/auth/provider";
import { ItemProperties } from "../core/item/ItemProperties";
import { useNetwork } from "../core/useNetwork";
import _ from "lodash";

const log = getLogger("ItemsList");

interface SortedMessages {
  [key: string]: {
    sender: string;
    unread: number;
    messages: ItemProperties[];
  };
}

const ItemsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { networkStatus } = useNetwork();
  const { assignments, fetching, fetchingError } = useContext(AssignmentContext);
  const sortedMessages = useMemo(() => {
    const store: SortedMessages = {};
    if (assignments == null) return [];
    for (let ass of assignments) {
      if (!store.hasOwnProperty(ass.sender)) {
        store[ass.sender] = {
          sender: ass.sender,
          unread: 0,
          messages: [],
        };
      }
      store[ass.sender].messages.push(ass);
      if (!ass.read) {
        store[ass.sender].unread += 1;
      }
      store[ass.sender].messages = _.orderBy(store[ass.sender].messages, "created", "desc");
    }
    let values = Array.from(Object.values(store));
    values = _.orderBy(values, (o) => o.messages[0].created, "desc");
    return values;
  }, [assignments]);
  const { logout } = useContext(AuthContext);
  log("render");
  const handleLogout = () => {
    log("handleLogin...");
    logout?.();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle id={"appTitle"}>App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching" />
        <IonToast
          isOpen={!networkStatus.connected}
          duration={2000}
          message={"No internet connection! Using data stored locally!"}
        />
        {sortedMessages.map((m) => (
          <Item sender={m.sender} unread={m.unread} messages={m.messages} key={m.sender} />
        ))}
        <IonLoading isOpen={fetching} message="Fetching items" />
        {fetchingError && <IonAlert isOpen={true} message={"No internet connection! Using data stored locally!"} />}
      </IonContent>
    </IonPage>
  );
};

export default ItemsList;

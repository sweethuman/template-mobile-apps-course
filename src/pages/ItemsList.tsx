import React, { useContext, useEffect, useState } from "react";
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

const log = getLogger("ItemsList");

const ItemsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { assignments, fetching, fetchingError, saving, savingError } = useContext(AssignmentContext);
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
        {assignments &&
          assignments.map(({ id, number, status, takenBy }) => {
            return <Item key={number} id={id} takenBy={takenBy} number={number} status={status} />;
          })}
        <IonLoading isOpen={fetching} message="Fetching items" />
        <IonLoading isOpen={saving} message="Updating item" />
        {fetchingError && <IonAlert isOpen={true} message={"No internet connection! Using data stored locally!"} />}
        {savingError && <IonAlert isOpen={true} message={"A save error happened.: " + savingError.message} />}
      </IonContent>
    </IonPage>
  );
};

export default ItemsList;

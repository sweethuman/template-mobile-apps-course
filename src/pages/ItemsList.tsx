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
  const { assignments, fetching, fetchingError } = useContext(AssignmentContext);
  const { logout } = useContext(AuthContext);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  const [loadedAssignments, setLoadedAssignments] = useState<ItemProperties[]>([]);
  const [searchAssignment, setSearchAssignment] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [loadedNumber, setLoadedNumber] = useState(6);
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
        {/*{<IonToast isOpen={!networkStatus.connected} duration={2000} message={"No internet connection! Using data stored locally!"}/>}*/}
        {loadedAssignments &&
          loadedAssignments
            .filter((assign) => {
              if (filter === "") return true;
              else return assign.date === filter;
            })
            .filter((assign) => assign.title.indexOf(searchAssignment) >= 0)
            .map(({ _id, title, date, description, pupilID, version, photoURL }) => {
              return (
                <Item
                  key={_id}
                  _id={_id}
                  title={title}
                  date={date}
                  description={description}
                  pupilID={pupilID}
                  version={version}
                  photoURL={photoURL}
                  onClick={(id) => history.push(`/assignment/${id}`)}
                />
              );
            })}
        <IonLoading isOpen={fetching} message="Fetching items" />
        {fetchingError && <IonAlert isOpen={true} message={"No internet connection! Using data stored locally!"} />}
      </IonContent>
    </IonPage>
  );
};

export default ItemsList;

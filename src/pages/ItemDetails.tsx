import React, { useContext, useEffect, useState } from "react";
import { IonPage } from "@ionic/react";
import { getLogger } from "../core";
import { AssignmentContext } from "../core/item/provider";
import { RouteComponentProps } from "react-router";
import { ItemProperties } from "../core/item/ItemProperties";

const log = getLogger("ItemDetails");

interface DetailedAssignmentProperties
  extends RouteComponentProps<{
    id?: string;
  }> {}

const ItemDetails: React.FC<DetailedAssignmentProperties> = ({ history, match }) => {
  const { assignments, saving, savingError, saveAssignment, resolveConflict, getConflict } =
    useContext(AssignmentContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [version, setVersion] = useState("");
  const [pupilID] = useState("");
  const [id, setId] = useState("");
  const [item, setItem] = useState<ItemProperties>();

  useEffect(() => {
    log("useEffect");
    const routeId = match.params.id || "";
    const assignment = assignments?.find((it) => it._id === routeId);
    setItem(assignment);
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description);
      setDate(assignment.date);
      setVersion(assignment.version);
      setId(assignment._id || "");
      // setLat(assignment.lat)
      // setLng(assignment.lng)
    }
  }, [match.params.id, assignments]);

  // const handleSave = () => {
  //   const editedAssignment = item ?
  //       { ...item, title, description, pupilID,date, version, lat, lng} : { title: title, description: description,date:date, pupilID: pupilID, version:version, lat: lat, lng:lng};
  //   saveAssignment && saveAssignment(editedAssignment).then(() => history.push("/items"));
  // };

  // const keepDataOnServer=async ()=>{
  //     let locals=await Storage.get({key:"assignments"})
  //     let localItems=JSON.parse(locals.value||"[]");
  //     if(currentConflict)
  //       for(let i=0;i<localItems.length;i++)
  //         if(currentConflict._id && localItems[i]._id===currentConflict._id) {
  //           localItems[i] = currentConflict;
  //           conflicts.splice(conflicts.indexOf(currentConflict._id),1)
  //           await Storage.set({key:`conflictingData`, value:JSON.stringify(conflicts)})
  //           await Storage.set({key:`assignments`, value:JSON.stringify(localItems)})
  //           history.push("/items")
  //           history.go(0)
  //           break;
  //         }
  // }

  // const changeDataOnServer=async ()=> {
  //   console.log("YUP")
  //   console.log(item + " " + resolveConflict)
  //   const myAssignment = item ?
  //       {...item, title, description, pupilID, date, version} : {
  //         title: title,
  //         description: description,
  //         date: date,
  //         pupilID: pupilID,
  //         version: version,
  //         lat:lat,
  //         lng:lng
  //       };
  //   resolveConflict && resolveConflict(myAssignment).then(async () => {
  //     if (currentConflict && currentConflict._id) {
  //       conflicts.splice(conflicts.indexOf(currentConflict._id), 1)
  //       await Storage.set({key: `conflictingData`, value: JSON.stringify(conflicts)})
  //     }
  //     history.push("/items")
  //     history.go(0)
  //   })
  // }

  log("render");

  return (
    //  ELEMENT DETAILS
    <IonPage>
      {/*<IonHeader>*/}
      {/*  <IonToolbar>*/}
      {/*    <IonTitle>Assignment details</IonTitle>*/}
      {/*    <IonButtons slot="end">*/}
      {/*      <IonButton onClick={handleSave}>*/}
      {/*        Save*/}
      {/*      </IonButton>*/}
      {/*    </IonButtons>*/}
      {/*  </IonToolbar>*/}
      {/*</IonHeader>*/}
      {/*<IonContent>*/}
      {/*  <IonItem>*/}
      {/*    <IonLabel >Title:</IonLabel>*/}
      {/*    <IonInput id={"title"} value={title} onIonChange={e => {setShowConflict(false);setTitle(e.detail.value || '')}}/>*/}
      {/*  </IonItem>*/}

      {/*  <IonItem>*/}
      {/*    <IonLabel >Content:</IonLabel>*/}
      {/*    <IonInput id={"content"} value={description} onIonChange={e =>{setShowConflict(false); setDescription(e.detail.value || '')}}/>*/}
      {/*  </IonItem>*/}
      {/*  <IonItem>*/}
      {/*    <IonLabel >Date:</IonLabel>*/}
      {/*    <IonInput id={"date"} value={date} onIonChange={e =>{setShowConflict(false);setDate(e.detail.value || '')}}/>*/}
      {/*  </IonItem>*/}
      {/*  <IonLoading isOpen={saving} />*/}

      {/*  /!*<CreateAnimation ref={chainAnimations}/>*!/*/}
      {/*  {savingError && (*/}
      {/*      <div>{savingError.message || 'Failed to save item'}</div>*/}
      {/*  )}*/}
      {/*</IonContent>*/}
    </IonPage>
  );
};

export default ItemDetails;

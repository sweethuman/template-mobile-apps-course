import React, { useCallback, useContext, useMemo, useState } from "react";
import { IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonItem, IonLabel } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";
import { AuthContext } from "../../core/auth/provider";
import { AssignmentContext } from "../../core/item/provider";

interface AssignmentPropertiesExt extends ItemProperties {}

const Item: React.FC<AssignmentPropertiesExt> = ({ id,name, takenBy,desiredBy }) => {
  const { token } = useContext(AuthContext);
  const { saveAssignment } = useContext(AssignmentContext);
  const [expanded, setExpanded] = useState(false);
  const takeAction = useCallback(() => {
    if (saveAssignment) {
      if(takenBy === token) {
        saveAssignment({id: id, name: name, takenBy: "", desiredBy: desiredBy})
      }else if(takenBy == null || takenBy == ""){
        const newDesire = desiredBy.filter((val) => val != token);
        saveAssignment({id: id, name: name, takenBy: token, desiredBy: newDesire})
      }else if(desiredBy.includes(token)){
        const newDesire = desiredBy.filter((val) => val != token);
        saveAssignment({id: id, name: name, takenBy: takenBy, desiredBy: newDesire})
      }else{
        saveAssignment({id: id, name: name, takenBy: takenBy, desiredBy: [...desiredBy, token]})
      }
    }
  }, [id,name, takenBy, desiredBy, saveAssignment, token]);
  const bgColor = useMemo(() => {
    if(takenBy === token) {
      return "red"
    }else if(takenBy == null || takenBy == ""){
      return "green"
    }else if(desiredBy.length != 0 && desiredBy[desiredBy.length - 1] == token){
      return "yellow"
    }else{
      return "white"
    }
  }, [takenBy, desiredBy, token]);
  const actionButton = useMemo(() => {
    let text = "";
    if(takenBy === token) {
      text = "Return"
    }else if(takenBy == null || takenBy == ""){
      text = "Take"
    }else if(desiredBy.includes(token)){
      text = "Remove request"
    }else{
      text = "Add request"
    }
    return <IonButton onClick={takeAction}>{text}</IonButton>;
  }, [takenBy, desiredBy, token, takeAction]);
  return (
    //LIST ITEM
    <IonItem class={"card"} onClick={() => setExpanded((val) => !val)}>
      <IonCardContent  style={{backgroundColor: bgColor}}>
        <IonCardTitle>
          {name}
        </IonCardTitle>
        {expanded ? <IonCardContent>
          <IonCardSubtitle>
            Desired by: {desiredBy.join(", ")}
          </IonCardSubtitle>
          <IonCardSubtitle>{actionButton}</IonCardSubtitle>
        </IonCardContent> : null}
      </IonCardContent>
    </IonItem>
  );
};
export default Item;

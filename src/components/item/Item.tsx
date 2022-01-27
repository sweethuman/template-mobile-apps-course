import React, { useCallback, useContext, useMemo, useState } from "react";
import { IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonItem, IonLabel } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";
import { AuthContext } from "../../core/auth/provider";
import { AssignmentContext } from "../../core/item/provider";

interface AssignmentPropertiesExt extends ItemProperties {}

const Item: React.FC<AssignmentPropertiesExt> = ({ id, number, status, takenBy }) => {
  const { token } = useContext(AuthContext);
  const { saveAssignment } = useContext(AssignmentContext);
  const [expanded, setExpanded] = useState(false);
  const takeSpace = useCallback(() => {
    if (saveAssignment) {
      saveAssignment({ id, number, status: "taken", takenBy: token });
    }
  }, [id, number, saveAssignment, token]);
  const releaseSpace = useCallback(() => {
    if (saveAssignment) {
      saveAssignment({ id, number, status: "free", takenBy: "" });
    }
  }, [id, number, saveAssignment]);
  const actionButton = useMemo(() => {
    if (status == "free") {
      return <IonButton onClick={takeSpace}>Take</IonButton>;
    } else if (status == "taken" && takenBy == token) {
      return <IonButton onClick={releaseSpace}>Release</IonButton>;
    }
    return <IonLabel>This is already taken and you can't do anything about it.</IonLabel>;
  }, [releaseSpace, status, takeSpace, takenBy, token]);
  return (
    //LIST ITEM
    <IonItem class={"card"}>
      <IonCardContent>
        <IonCardTitle>
          {number} - {status}
        </IonCardTitle>
        <IonCardSubtitle>
          <IonButton onClick={() => setExpanded((val) => !val)}>Expand</IonButton>
        </IonCardSubtitle>
        {expanded ? <IonCardContent>{actionButton}</IonCardContent> : null}
      </IonCardContent>
    </IonItem>
  );
};
export default Item;

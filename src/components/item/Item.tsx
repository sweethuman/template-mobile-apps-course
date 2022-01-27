import React from "react";
import { IonCardContent, IonCardSubtitle, IonCardTitle, IonItem } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";

interface AssignmentPropertiesExt extends ItemProperties {
  onClick: (id?: string) => void;
}

const Item: React.FC<AssignmentPropertiesExt> = ({ id, number, status, takenBy, onClick }) => {
  return (
    //LIST ITEM
    <IonItem class={"card"} onClick={() => onClick(id)}>
      <IonCardContent>
        <IonCardTitle>{number}</IonCardTitle>
        <IonCardSubtitle>{status}</IonCardSubtitle>
      </IonCardContent>
    </IonItem>
  );
};
export default Item;

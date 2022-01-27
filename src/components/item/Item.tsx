import React from "react";
import { IonCardSubtitle, IonIcon, IonCardContent, IonCard, IonItem, IonImg } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";
import { book, pencil } from "ionicons/icons";
import { IonCardTitle } from "@ionic/react";

interface AssignmentPropertiesExt extends ItemProperties {
  onClick: (id?: string) => void;
}

const Item: React.FC<AssignmentPropertiesExt> = ({ id, onClick }) => {
  return (
    //LIST ITEM
    <IonItem class={"card"} onClick={() => onClick(id)}>
      {/*<IonCardContent>*/}
      {/*    <IonIcon icon={pencil} slot="end"/>*/}
      {/*    <IonIcon icon={book} slot="end"/>*/}
      {/*    <IonCardTitle>{title}</IonCardTitle>*/}
      {/*    <IonCardSubtitle>{description}</IonCardSubtitle>*/}
      {/*</IonCardContent>*/}
    </IonItem>
  );
};
export default Item;

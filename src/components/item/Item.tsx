import React, { useEffect, useState } from "react";
import { IonCardContent, IonCardTitle, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";

interface AssignmentPropertiesExt extends ItemProperties {
  onClick: (truth: boolean) => void;
}

const Item: React.FC<AssignmentPropertiesExt> = ({ id, text, options, indexCorrectOption, onClick }) => {
  const [lock, setLock] = useState(false);
  useEffect(() => {
    setLock(false);
  }, [id]);
  return (
    //LIST ITEM
    <IonItem class={"card"}>
      <IonCardContent>
        <IonCardTitle>{text}</IonCardTitle>
        <IonCardContent>
          <IonList>
            <IonRadioGroup
              onIonChange={(val) => {
                setLock(true);
                if (val.detail.value === indexCorrectOption) {
                  onClick(true);
                } else {
                  onClick(false);
                }
              }}>
              {options.map((option) => (
                <IonItem key={option}>
                  <IonLabel>{option}</IonLabel>
                  <IonRadio value={option} disabled={lock} />
                </IonItem>
              ))}
            </IonRadioGroup>
          </IonList>
        </IonCardContent>
      </IonCardContent>
    </IonItem>
  );
};
export default Item;

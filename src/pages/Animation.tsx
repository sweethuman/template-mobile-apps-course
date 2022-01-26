import React, { useRef } from "react";
import {
  createAnimation,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { book, pencil } from "ionicons/icons";

const Animation: React.FC = () => {
  const text = useRef<HTMLIonItemElement>(null);
  React.useEffect(() => {
    if (text.current) {
      const animation = createAnimation()
        .addElement(text.current)
        .duration(1000)
        .direction("alternate")
        .iterations(Infinity)
        .keyframes([
          { offset: 0, opacity: "1" },
          {
            offset: 1,
            opacity: "0.5",
          },
        ]);
      animation.play();
    }
  }, []);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome! Please login!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem class="card" ref={text}>
          <IonCardContent>
            <IonIcon icon={pencil} slot="end" />
            <IonIcon icon={book} slot="end" />
            <IonCardTitle>Hello</IonCardTitle>
            <IonCardSubtitle>Boo Hoo</IonCardSubtitle>
          </IonCardContent>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default Animation;

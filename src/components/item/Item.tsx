import React, { useContext, useEffect, useState } from "react";
import { IonCardSubtitle, IonIcon, IonCardContent, IonCard, IonItem, IonImg, IonList } from "@ionic/react";
import { ItemProperties } from "../../core/item/ItemProperties";
import { book, pencil } from "ionicons/icons";
import { IonCardTitle } from "@ionic/react";
import { AssignmentContext } from "../../core/item/provider";
import { getLogger, withLogs } from "../../core";

interface AssignmentPropertiesExt {
  sender: string;
  unread: number;
  messages: ItemProperties[];
}

const log = getLogger("Item");

const Item: React.FC<AssignmentPropertiesExt> = ({ sender, unread, messages }) => {
  const [expand, setExpand] = useState(false);
  const { saveAssignment } = useContext(AssignmentContext);
  useEffect(() => {
    let cancel = false;
    if (!expand) return;
    async function readMess() {
      for (let mess of messages) {
        if (cancel) return;
        if (mess.read) continue;
        await saveAssignment({ ...mess, read: true });
        log("Item ", mess.id, " read");
      }
    }
    readMess();
    return () => {
      cancel = true;
    };
  }, [expand, messages, saveAssignment]);
  return (
    //LIST ITEM
    <IonItem class={"card"} onClick={() => setExpand((val) => !val)}>
      <IonCardContent>
        <IonCardTitle>{sender}</IonCardTitle>
        <IonCardSubtitle>{unread}</IonCardSubtitle>
        {expand ? (
          <IonCardContent>
            <IonList>
              {messages.map((message) => (
                <IonItem
                  key={message.id}
                  style={{
                    fontWeight: message.read ? "normal" : "bold",
                  }}>
                  {message.text}
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        ) : null}
      </IonCardContent>
    </IonItem>
  );
};
export default Item;

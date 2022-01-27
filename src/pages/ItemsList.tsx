import React, { useCallback, useContext, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Item from "../components/item/Item";
import { getLogger } from "../core";
import { AssignmentContext } from "../core/item/provider";
import { AuthContext } from "../core/auth/provider";

const log = getLogger("ItemsList");

const ItemsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { assignments, fetching, fetchingError } = useContext(AssignmentContext);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [timeout, updateTimeout] = useState<number>(-1);
  const goToNext = useCallback(() => {
    if (timeout != null) clearTimeout(timeout);
    setCurrentQuestion((val) => val + 1);
  }, [timeout]);
  const setAnswerTruthness = useCallback(
    (truth: boolean) => {
      if (truth) {
        setCorrectAnswers((prev) => prev + 1);
      }
      setShowButton(true);
      // @ts-ignore
      updateTimeout(setTimeout(() => goToNext(), 5000));
    },
    [goToNext],
  );
  const item = useMemo(() => {
    if (assignments == null) return <IonLabel>Assginment is empty</IonLabel>;
    return (
      <Item
        id={assignments[currentQuestion].id}
        text={assignments[currentQuestion].text}
        indexCorrectOption={assignments[currentQuestion].indexCorrectOption}
        options={assignments[currentQuestion].options}
        onClick={setAnswerTruthness}
      />
    );
  }, [assignments, currentQuestion, setAnswerTruthness]);
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
        {item}
        <IonLoading isOpen={fetching} message="Fetching items" />
        {fetchingError && <IonAlert isOpen={true} message={"No internet connection! Using data stored locally!"} />}
        {showButton ? <IonButton onClick={goToNext}>Next</IonButton> : null}
      </IonContent>
      <IonLabel>
        Total Questions Answered {correctAnswers} / {assignments?.length}
      </IonLabel>
    </IonPage>
  );
};

export default ItemsList;

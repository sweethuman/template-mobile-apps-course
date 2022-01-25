import { useEffect, useState } from "react";
import { ConnectionStatus, Network } from "@capacitor/network";

const initialNetworkState = {
  connected: false,
  connectionType: "unknown",
};

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState(initialNetworkState);
  useEffect(() => {
    Network.addListener("networkStatusChange", handleNetworkStatusChange);
    Network.getStatus().then(handleNetworkStatusChange);
    let canceled = false;
    return () => {
      canceled = true;
      //handler.remove();
    };

    async function handleNetworkStatusChange(status: ConnectionStatus) {
      console.log("useNetwork - status change", status);
      if (!canceled) {
        setNetworkStatus(status);
      }
    }
  }, []);
  return { networkStatus };
};

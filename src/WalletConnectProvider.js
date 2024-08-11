// src/WalletConnectProvider.js

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

const connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org", // Required for v1
    // Remove `projectId` for v1, use it only for v2.
});

if (!connector.connected) {
    connector.createSession();
}

connector.on("connect", (error, payload) => {
    if (error) {
        throw error;
    }
    // Get provided accounts and chainId
    const { accounts, chainId } = payload.params[0];
    console.log(accounts, chainId);
});

export default connector;

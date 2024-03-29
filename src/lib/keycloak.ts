import {appointmentsStore, authStore, selectedDate} from "./stores";
import {getAppointments} from "./network/api";
import Keycloak from "keycloak-js";
import {Authentication} from "./model/Authentication";

function initApplication(){
    selectedDate.subscribe((date) => {
        // Clean appointmentsStore to evoke loading animation
        // appointmentsStore.set([]);
        getAppointments(date).then(appointmentsStore.set).catch(console.error);
    });
}

const kcConf = {
    clientId: "Waschmarken",
    realm: "oph",
    "auth-server-url": "http://localhost:8080/",
    "ssl-required": "external",
    resource: "Waschmarken",
    "public-client": true,
    "confidential-port": 0,
    onLoad: "login-required",
    messageReceiveTimeout: 1000,
};

export function initKeycloak() {
    const keycloak = new Keycloak(kcConf);
    keycloak
        .init({
            onLoad: "login-required",
            checkLoginIframe: false,
        })
        .then(function (authenticated) {
            if (!authenticated){
                // TODO: Handle unauthenticated error
                return;
            }

            const token = keycloak.token;
            if (token === undefined) {
                // TODO: Handle token null error
                return;
            }

            const auth = new Authentication(token);
            authStore.set(auth);
            initApplication();
        })
        .catch((reason) => {
            console.log(reason);
        });
}
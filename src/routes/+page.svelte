<script lang="ts">
    import DayView from "../lib/components/DayView.svelte";
    import DateNavigator from "../lib/components/DateNavigator.svelte";
    import Keycloak from "keycloak-js";
    import { onMount } from "svelte";
    import {Authentication} from "../lib/model/Authentication";
    import {appointmentsStore, authStore, selectedDate} from "../lib/stores";
    import {getAppointments} from "../lib/api";

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

    function initApplication(){
        selectedDate.subscribe((date) => {
            // Clean appointmentsStore to evoke loading animation
            // appointmentsStore.set([]);
            getAppointments(date, $authStore).then(appointmentsStore.set).catch(console.error);
        });
    }

    function initKeycloak() {
        const keycloak = new Keycloak(kcConf);
        keycloak
            .init({
                onLoad: "login-required",
                checkLoginIframe: false,
            })
            .then(function (authenticated) {
                if (authenticated){
                    const auth = new Authentication(keycloak.token);
                    authStore.set(auth);
                    initApplication();
                }
                else {
                    // TODO: Handle unauthenticated error
                }
            })
            .catch((reason) => {
                console.log(reason);
            });
    }
    onMount(async () => {
        initKeycloak();
	});

</script>

<div id="dateNav">
    <DateNavigator />
</div>
<div>
    <DayView />
</div>

<style>
    #dateNav {
        display: flex;
        justify-content: center;
    }
</style>

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/global.css"; // Import global styles

createApp(App).use(router).mount("#app");

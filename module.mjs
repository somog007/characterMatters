// @ts-check
import { module } from "@prisma/composer";
import videoEbookPlatformBackendService from "./backend/service.mjs";
import webService from "./web/service.mjs";

export default module("character-matters", ({ provision }) => {
  provision(videoEbookPlatformBackendService, { id: "videoebookplatformbackend" });
  provision(webService);
});

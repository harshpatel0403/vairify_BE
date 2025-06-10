import express from "express";
import {
  updateMarketSearch,
  createMarketSearch,
  getMarketSearch,
  getMarketSearchResult,
  Invitation,
  DeleteMarketPlace,
  myinvitation,
  searchFromVairifyId,
  marketplaceInvitation,
} from "../Controllers/MarketPlaceController.js";

const marketRouter = express.Router();

marketRouter.post("/create", createMarketSearch);
marketRouter.get("/get-market/:userId", getMarketSearch);
marketRouter.put("/edit/:id", updateMarketSearch);
marketRouter.get("/get/:id", getMarketSearchResult);
marketRouter.post("/invitation", Invitation);
marketRouter.post("/marketplaceInvitation", marketplaceInvitation);
marketRouter.delete("/delete/:id", DeleteMarketPlace);
marketRouter.get("/invitation/:id", myinvitation);
marketRouter.get("/get-vairify/:id", searchFromVairifyId);

export default marketRouter;

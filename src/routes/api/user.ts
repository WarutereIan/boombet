import { Router } from "express";
import { User } from "../../controllers/user/user";

const router = Router();

router.get("/getLiveMatches", User.getListOfLiveMatches);

router.post("/getTeamStats", User.getTeamStats);

router.post("/getLeagueStats", User.getLeagueStats);

router.post("/getEventStats", User.getEventStats);

router.get("/getBookies", User.getBookies);

router.post("/convertBookingCode", User.convertBetCode);

module.exports = router;

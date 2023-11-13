import { Router } from "express";
import { User } from "../../controllers/user/user";

const router = Router();

router.get("/getLiveMatches", User.getListOfLiveMatches);

router.post("/getTeamStats", User.getTeamStats);

router.post("/getLeagueStats", User.getLeagueStats);

router.post("/getEventStats", User.getEventStats);

router.get("/getBookies", User.getBookies);

router.post("/convertBookingCode", User.convertBetCode);

router.post("/searchTeam", User.searchTeam);

router.post("/searchLeague", User.searchLeague);

router.post("/events-by-date", User.searchEventsByDate);

router.post("/get-event-by-date-and-league", User.searchEventsByDateAndLeague);

module.exports = router;

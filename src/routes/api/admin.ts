import { Router } from "express";
import { check } from "express-validator";
import {
  addBookie,
  adminGetEventsByDate,
  deleteBookie,
  login,
  signUp,
  updateBookie,
  updatePrediction,
  uploadClub,
  uploadLeague,
} from "../../controllers/admin/admin";
import { validateToken } from "../../middlewares/auth";
import { isRegularExpressionLiteral } from "typescript";

const router = Router();

router.post(
  "/signup",
  [
    check("phone_number", "Phone Number is required").not().isEmpty().trim(),
    check("password")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password length must be greater than 6 and contain at least one lowercase letter, one uppercase letter and one number"
      ),
    check("username", "Username is required")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .custom((value) => {
        // ensure that username contains only letters and numbers
        if (!/^[a-zA-Z0-9]+$/.test(value)) {
          throw new Error("Username must contain only letters and numbers");
        }
        return true;
      }),
    check("email")
      .isEmail()
      .withMessage("Email format is invalid")
      .normalizeEmail(),
  ],
  signUp
);

router.post(
  "/login",
  [
    //check("phone_number", "Phone Number is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  login
);

router.put("/updateBookie", validateToken, updateBookie);

router.post("/addBookie", validateToken, addBookie);

router.delete("/deleteBookie", validateToken, deleteBookie);

router.post("/updatePrediction", validateToken, updatePrediction);

router.post("/uploadClub", validateToken, uploadClub);

router.post("/uploadLeague", validateToken, uploadLeague);

//router.post("/events-by-date", validateToken,adminGetEventsByDate)

module.exports = router;

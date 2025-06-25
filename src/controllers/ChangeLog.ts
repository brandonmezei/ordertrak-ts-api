import { Request, Response } from "express";
import { ChangeLog } from "../models/ChangeLog";
import { ChangeLogDetails } from "../models/ChangeLogDetails";
import { AuthRequest } from "../middleware/authMiddleware";

export const createChangeLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { TicketInfo } = req.body;

    // Validate required fields
    if (!TicketInfo || !Array.isArray(TicketInfo) || TicketInfo.length === 0) {
      res.status(400).json({ error: "TicketInfo (array) is required." });
      return;
    }

    // Create multiple ChangeLogDetails
    const detailsDocs = await ChangeLogDetails.insertMany(
      TicketInfo.map((ticket: string) => ({
        TicketInfo: ticket?.trim(),
        CreateName: req.user?.Email || "SYSTEM",
      }))
    );

    // Create ChangeLog with all details' IDs
    const changeLog = new ChangeLog({
      Details: detailsDocs.map((doc) => doc._id),
      CreateName: req.user?.Email || "SYSTEM",
    });

    await changeLog.save();

    res.status(201).json({ message: "Ticket created.", changeLog });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getChangeLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const changeLogs = await ChangeLog.find({ IsDelete: false })
      .populate("Details")
      .sort({ CreateDate: -1 })
      .limit(3);

    res.status(200).json(changeLogs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

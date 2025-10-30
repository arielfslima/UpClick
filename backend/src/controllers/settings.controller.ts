import { Request, Response } from 'express';
import databaseService from '../services/database.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = databaseService.getClient();

/**
 * Get all settings
 */
export const getAllSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const settings = await prisma.appSettings.findMany({
    orderBy: {
      key: 'asc',
    },
  });

  // Convert array to object for easier access
  const settingsObj = settings.reduce((acc: any, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  logger.info(`Fetched ${settings.length} settings`);

  res.json({
    success: true,
    data: settingsObj,
  });
});

/**
 * Get a specific setting by key
 */
export const getSettingByKey = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;

  const setting = await prisma.appSettings.findUnique({
    where: { key },
  });

  if (!setting) {
    throw new AppError(`Setting '${key}' not found`, 404);
  }

  res.json({
    success: true,
    data: {
      key: setting.key,
      value: setting.value,
    },
  });
});

/**
 * Update or create a setting
 */
export const upsertSetting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { key, value, description } = req.body;

  const setting = await prisma.appSettings.upsert({
    where: { key },
    update: {
      value: value.toString(),
      description,
    },
    create: {
      key,
      value: value.toString(),
      description,
    },
  });

  logger.info(`Updated setting: ${key}`);

  res.json({
    success: true,
    data: setting,
    message: 'Setting updated successfully',
  });
});

/**
 * Update multiple settings at once
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const settings = req.body;

  const updates = Object.keys(settings).map((key) => {
    return prisma.appSettings.upsert({
      where: { key },
      update: {
        value: settings[key].toString(),
      },
      create: {
        key,
        value: settings[key].toString(),
      },
    });
  });

  await Promise.all(updates);

  logger.info(`Updated ${updates.length} settings`);

  res.json({
    success: true,
    message: `${updates.length} settings updated successfully`,
  });
});

/**
 * Delete a setting
 */
export const deleteSetting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;

  const setting = await prisma.appSettings.findUnique({
    where: { key },
  });

  if (!setting) {
    throw new AppError(`Setting '${key}' not found`, 404);
  }

  await prisma.appSettings.delete({
    where: { key },
  });

  logger.info(`Deleted setting: ${key}`);

  res.json({
    success: true,
    message: 'Setting deleted successfully',
  });
});

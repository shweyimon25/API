import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
class SystemParameterController {

  async findInfo(req: Request, res: Response) {
    const systemParameter = await prisma.systemParameter.findMany({
        where: {
        key: { in: ['ip_address', 'is_eligible_for_purchase'] }
        }
    });
    const config = Object.fromEntries(systemParameter.map(s => [s.key, s.value]));

    res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
          isFullFilled: true,
          message: 'Hello Frontend',
          data: {
          ip_address: config.ip_address,
          is_eligible_for_purchase: config.is_eligible_for_purchase 
          }
      }
    });
  }

  async findForceUpdateStatus(req: Request, res: Response) {
    const systemParameter = await prisma.systemParameter.findMany({
        where: {
        key: { in: ['to_force_update'] }
        }
    });
    const config = Object.fromEntries(systemParameter.map(s => [s.key, s.value]));

    res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
          isFullFilled: true,
          message: config.to_force_update === 'True' ? true : false
      }
    });
  }
  

  async findAppVersionInfo(req: Request, res: Response) {
    try {
      const { platform } = req.body.params; 
      const keys = [
        'android_package_name', 'android_store_url', 'android_store_version',
        'ios_package_name', 'ios_store_url', 'ios_store_version'
      ];

      const systemParameters = await prisma.systemParameter.findMany({
        where: { key: { in: keys } }
      });

      const config = Object.fromEntries(systemParameters.map(s => [s.key, s.value]));

      const isConfigComplete = keys.every(key => config[key] !== undefined && config[key] !== null);

      if (!isConfigComplete) {
        return res.json({
          "jsonrpc": "2.0",
          "id": null,
          "result": {
            isFullFilled: false,
            message: "Error: Android or iOS package name not configured in backend."
          }
        });
      }

      let results: any[] = [];

      if (platform === 'android') {
        results.push({
          storeVersion: config.android_store_version,
          storeUrl: config.android_store_url,
          packageName: config.android_package_name,
        });
      } else if (platform === 'ios') {
        results.push({
          storeVersion: config.ios_store_version,
          storeUrl: config.ios_store_url,
          packageName: config.ios_package_name,
        });
      } else {
        throw new Error("Unsupported platform");
      }

      // Success Response
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          isFullFilled: true,
          message: 'Success',
          data: {
            results: results
          }
        }
      });

    } catch (error: any) {
      // Error Handling
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          isFullFilled: false,
          message: `Error: ${error.message}`
        }
      });
    }
  }
}

export default SystemParameterController;


import { Request, Response } from "express";
import ReportCategoryService from "../../../services/member/v1/report-category.service"; 
import { successResponse } from "../../../helpers/response";
import { ReportCategoryCollection } from "../../../resources/member/v1/report-category/report-category.collection";
import { ReportCategoryResource } from "../../../resources/member/v1/report-category/report.category.resource";
import { reportCategoryScope } from "../../../scopes/member/v1/report-category.scope";

class ReportCategoryController {
  private reportCategoryService: ReportCategoryService;

  constructor() {
    this.reportCategoryService = new ReportCategoryService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    
    const where = reportCategoryScope(req.query);

    if (page && perPage) {
      const reportCategorys = await this.reportCategoryService.findByPaginate(+page, +perPage, where);
      return res.json({
          "jsonrpc": "2.0",
          "id": null,
          "result":{
          "isFullFilled": true,
          "result": {
              data : {
                  "count": reportCategorys.meta.totalCount,
                  "results": ReportCategoryCollection.toCollection(reportCategorys.data)
              }
          }
        }
      });
      
    }

    const reportCategorys = await this.reportCategoryService.findAll(where);

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result":{
        "isFullFilled": true,
        "result": {
            data : {
                "count": reportCategorys.count,
                "results": ReportCategoryCollection.toCollection(reportCategorys.results)
            }
        }
        }
    }); 
  }

  async findOne(req: Request, res: Response) {
    const reportCategory = await this.reportCategoryService.findOne(
      +req.params.id
    );
    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result":{
        "isFullFilled": true,
        "result": {
            data : {
                "results": ReportCategoryResource.toResource(reportCategory)
            }
        }
        }
    });
  }
}

export default ReportCategoryController;

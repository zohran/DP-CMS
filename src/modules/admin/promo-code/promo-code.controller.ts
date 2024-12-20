import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { PromoCodeService } from "./promo-code.service";
import { CreatePromoCode, ValidatePromoCode } from "./dto";
import { PromoCode } from "./promo-code.entity";
import { CustomRequest } from "src/shared/custom-interface";

@Controller("admin/promo-code")
export class PromoCodeController {
  constructor(private readonly promocodeService: PromoCodeService) {}

  @Get()
  async getAllPromoCodes() {
    return await this.promocodeService.getAllPromoCodes();
  }

  @Get("drop-downs")
  async getPromoCodeDropDowns(@Req() req: CustomRequest) {
    const { env } = req;
    return await this.promocodeService.getPromoCodeDropDowns(
      env?.base_url,
      env?.token
    );
  }

  @Post()
  async createPromoCode(
    @Body() promoCode: CreatePromoCode
  ): Promise<PromoCode> {
    return await this.promocodeService.createPromoCode(promoCode);
  }

  @Post("validate")
  async validatePromoCode(
    @Body() body: ValidatePromoCode,
    @Req() req: CustomRequest
  ): Promise<any> {
    const { user } = req;
    return await this.promocodeService.validatePromoCode(
      body,
      user?._id.toString()
    );
  }
}

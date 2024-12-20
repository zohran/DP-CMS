import { forwardRef, Module } from "@nestjs/common";
import { IncidentController } from "./incident.controller";
import { IncidentService } from "./incident.service";
import { ApiModule } from "src/modules/api/api.module";
import { EnvironmentModule } from "src/modules/admin/environment/environment.module";
import { CmsModule } from "../../cms.module";

@Module({
  imports: [forwardRef(() => ApiModule)],
  controllers: [IncidentController],
  providers: [IncidentService]
})
export class IncidentModule {}

import app from "./server";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`App is running on port ${PORT}`);
});
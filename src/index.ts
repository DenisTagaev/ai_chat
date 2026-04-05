import app from "./server";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`App is running on port ${PORT}`);
});
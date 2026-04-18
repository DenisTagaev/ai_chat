import { asyncLocalStorage, getRequestContext } from "../../utils/requestContext";
import { RequestContext } from "../../utils/types";

describe("getRequestContext", () => {
    it("should return undefined when not set", () => {
        const context: RequestContext | undefined = getRequestContext();
        expect(context).toBeUndefined();
    });

    it("should return the context set in asyncLocalStorage", () => {
        const testContext: RequestContext = { reqId: "test-req-id", userId: "test-user-id" };

        asyncLocalStorage.run(testContext, () => {
            expect(getRequestContext()).toEqual(testContext);
        });
    });

    it("should isolate context between different asyncLocalStorage runs", () => {
        const context1: RequestContext = { reqId: "req-id-1", userId: "user-id-1" };
        const context2: RequestContext = { reqId: "req-id-2", userId: "user-id-2" };

        asyncLocalStorage.run(context1, () => {
            expect(getRequestContext()).toEqual(context1);
            asyncLocalStorage.run(context2, () => {
                expect(getRequestContext()).toEqual(context2);
            });

            expect(getRequestContext()).toEqual(context1);
        });
    });

    it("should persist context across asynchronous calls", async () => {
        const testContext: RequestContext | undefined = {
          reqId: "async-req-id",
          userId: "async-user-id",
        };

        await new Promise((resolve) => {
            asyncLocalStorage.run(testContext, () => {
                setTimeout(() => {
                    expect(getRequestContext()).toEqual(testContext);
                    resolve(null);
                }, 100);
            });
        });
    });

});
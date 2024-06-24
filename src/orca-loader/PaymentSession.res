open Types

let make = (
  options,
  ~clientSecret,
  ~publishableKey,
  ~logger: option<OrcaLogger.loggerMake>,
  ~ephimeralKey,
) => {
  let logger = logger->Option.getOr(OrcaLogger.defaultLoggerConfig)
  let switchToCustomPod =
    GlobalVars.isInteg &&
    options
    ->JSON.Decode.object
    ->Option.flatMap(x => x->Dict.get("switchToCustomPod"))
    ->Option.flatMap(JSON.Decode.bool)
    ->Option.getOr(false)
  let endpoint = ApiEndpoint.getApiEndPoint(~publishableKey, ())

  let defaultInitPaymentSession = {
    getCustomerSavedPaymentMethods: _ =>
      PaymentSessionMethods.getCustomerSavedPaymentMethods(
        ~clientSecret,
        ~publishableKey,
        ~endpoint,
        ~logger,
        ~switchToCustomPod,
      ),
    getPaymentManagementMethods: _ =>
      PaymentSessionMethods.getPaymentManagementMethods(
        ~ephimeralKey,
        ~logger,
        ~switchToCustomPod,
        ~endpoint,
      ),
  }

  defaultInitPaymentSession
}

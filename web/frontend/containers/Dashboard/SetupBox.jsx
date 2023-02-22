import * as P from "@shopify/polaris";

import generatedUpsalesJSON from "../../../server/handlers/generatedUpsales.json";

const getTasks = (t) => [
  {
    title: t("t1"),
    description: t("t1-description"),
    button: {
      label: t("t1-button-label"),
      action: 'enable-app'
    }
  },
  {
    title: t("t2"),
    description: t("t2-description"),
    icon: true,
    button: {
      label: t("t2-button-label"),
      action: 'go-upsell-list'
    }
  },
  {
    title: t("t3"),
    description: t("t3-description"),
    button: {
      label: t("t3-button-label"),
      action: 'go-new-upsell'
    }
  },
  {
    title: t("t4"),
    description: t("t4-description"),
    button: {
      label: t("t4-button-label"),
      action: 'open-chat'
    }
  }
];

const getValidatedTasks = ({ shop, upsales }) => {
  let validatedTasks = 0;

  const generatedUpsales = generatedUpsalesJSON.map((g) => g.title);

  if (shop && shop.isAppEnabled) {
    validatedTasks += 1;
  } else {
    return validatedTasks;
  }

  if (upsales && upsales.find((u) => u.isActive)) {
    validatedTasks += 1;
  } else {
    return validatedTasks;
  }

  if (
    upsales &&
    upsales.find((u) => (generatedUpsales.includes(u.title) ? null : u))
  ) {
    validatedTasks += 1;
  } else {
    return validatedTasks;
  }

  if (shop && shop.isAppVerified) {
    validatedTasks += 1;
  } else {
    return validatedTasks;
  }

  return validatedTasks;
}

const SetupBox = ({ t, shop, upsales, onDismiss, onAction }) => {
  const validatedTasks = getValidatedTasks({
    shop,
    upsales
  });

  let tasks = getTasks(t);

  if (validatedTasks === tasks.length) {
    return null;
  }

  const validatedPercent = (100 * validatedTasks) / tasks.length;

  return (
    <div className="my-12 Polaris-Layout">
      <P.Layout.Section>
        <P.Card sectioned>
          <div>
            <div className="mx-6 progress-header flex justify-between">
              <div className="progress-title">{t("getting-started")}</div>
              <div className="progress-percent">{validatedPercent}%</div>
            </div>
            <div className="progress-bar mx-6 mt-3">
              <P.ProgressBar className="mx-6 mt-3" progress={validatedPercent} size="small" />
            </div>
          </div>
          <div className="progress-steps md:grid md:grid-cols-2 md:gap-4 mt-8">
            <div className="steps-list px-6">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center border-b border-gray-400 last:border-b-0 px-3 py-6">
                  <div style={{ transform: "scale(0.8)" }}>
                    {i + 1 <= validatedTasks ? (
                      <svg
                        width="28"
                        height="28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle fill="#BBE5B3" cx="14" cy="14" r="14" />
                          <g transform="translate(4 4)">
                            <circle fill="#FFF" cx="10" cy="10" r="9" />
                            <path
                              d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8m2.293-10.707L9 10.586 7.707 9.293a.999.999 0 10-1.414 1.414l2 2a.997.997 0 001.414 0l4-4a.999.999 0 10-1.414-1.414"
                              fill="#108043"
                            />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        width="28"
                        height="28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle fill="#f9e3b3" cx="14" cy="14" r="14" />
                          <circle fill="#ffffff" cx="50%" cy="50%" r="8" />
                        </g>
                      </svg>
                    )}
                  </div>
                  <div
                    className="ml-6 text-2xl text-gray-500"
                  >
                    {task.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="step-info relative px-6 md:px-0 py-6 md:py-0">
              <P.TextContainer>
                <P.Heading>{tasks[validatedTasks].title}</P.Heading>
                <p>
                  {tasks[validatedTasks].description}
                  {tasks[validatedTasks].icon && (
                    <svg
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        display: 'inline',
                        paddingLeft: '0.5rem',
                        width: '20px'
                      }}
                    >
                      <path d="M17.928 9.628C17.837 9.399 15.611 4 10 4S2.162 9.399 2.07 9.628a1.017 1.017 0 0 0 0 .744C2.163 10.601 4.389 16 10 16s7.837-5.399 7.928-5.628a1.017 1.017 0 0 0 0-.744zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 .002 4.001A2 2 0 0 0 9.999 8z"/>
                    </svg>
                  )}
                </p>
                {tasks[validatedTasks].button && (
                  <P.Button
                    primary={true}
                    size="medium"
                    onClick={() => onAction(tasks[validatedTasks].button.action)}
                  >{tasks[validatedTasks].button.label}</P.Button>
                )}
              </P.TextContainer>
              <div
                className="absolute bottom-0 right-0 text-gray-500 underline cursor-pointer hover:text-gray-700"
                onClick={() => validatedTasks >= 4 ? onDismiss(true) : onDismiss(false)}
              >
                {t("dismiss")}
              </div>
            </div>
          </div>
        </P.Card>
      </P.Layout.Section>
    </div>
  );
};

export default SetupBox;

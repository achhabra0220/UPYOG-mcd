import { CardSectionHeader, CheckPoint, ConnectingCheckPoints, Loader, SubmitBar } from "@nudmcdgnpm/digit-ui-react-components";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PTRWFCaption from "./PTRWFCaption";


const PTRWFApplicationTimeline = (props) => {
  
  const { t } = useTranslation();
  const businessService = props?.application?.workflow?.businessService;
  

  const { isLoading, data } = Digit.Hooks.useWorkflowDetails({
    tenantId: props.application?.tenantId,
    id: props.application?.applicationNumber,
    moduleCode: businessService,
  });
  

  function OpenImage(thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const getTimelineCaptions = (checkpoint) => {
    
    if (checkpoint.state === "OPEN")
    {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        source: props.application?.channel || "",
      };
      return <PTRWFCaption data={caption} />;
    }
    else if (checkpoint.state) {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assignes?.[0]?.name,
        mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
        comment: t(checkpoint?.comment),
        wfComment: checkpoint.wfComment,
        thumbnailsToShow: checkpoint?.thumbnailsToShow,
      };
      return <PTRWFCaption data={caption} OpenImage={OpenImage} />;
    } 
    
   
    else {
      const caption = {
        date: Digit.DateUtils.ConvertTimestampToDate(props.application?.auditDetails.lastModified),
        name: checkpoint?.assigner?.name,
        comment: t(checkpoint?.comment),
      };
      return <PTRWFCaption data={caption} />;
    }
  };

  const showNextActions = (nextActions) => {
    let nextAction = nextActions[0];
    const next = nextActions.map((action) => action.action);
    if (next.includes("PAY") || next.includes("EDIT")) {
      let currentIndex = next.indexOf("EDIT") || next.indexOf("PAY");
      currentIndex = currentIndex != -1 ? currentIndex : next.indexOf("PAY");
      nextAction = nextActions[currentIndex];
    }
    switch (nextAction?.action) {
      case "PAY":
        return (
          props?.userType === 'citizen'
          ? (
          <div style={{ marginTop: "1em", bottom: "0px", width: "100%", marginBottom: "1.2em" }}>
            <Link
              to={{ pathname: `/digit-ui/citizen/payment/my-bills/${businessService}/${props?.application?.applicationNumber}`, state: { tenantId: props.application.tenantId, applicationNumber : props?.application?.applicationNumber } }}
            >
              <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} />
            </Link>
          </div>
          ) : null
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      {!isLoading && (
        <Fragment>
          {data?.timeline?.length > 0 && (
            <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>
              {t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}
            </CardSectionHeader>
          )}
          {data?.timeline && data?.timeline?.length === 1 ? (
            <CheckPoint
              isCompleted={true}
              label={t((data?.timeline[0]?.state && `WF_${businessService}_${data.timeline[0].state}`) || "NA")}
              customChild={getTimelineCaptions(data?.timeline[0])}
            />
          ) : (
            <ConnectingCheckPoints>
              {data?.timeline &&
                data?.timeline.map((checkpoint, index, arr) => {
                  
                  let timelineStatusPostfix = "";
                  return (
                    <React.Fragment key={index}>
                      <CheckPoint
                        keyValue={index}
                        isCompleted={index === 0}
                       //label={checkpoint.state ? t(`WF_${businessService}_${checkpoint.state}`) : "NA"}
                       label={t(
                        `ES_PTR_COMMON_STATUS_${data?.processInstances[index].state?.["state"]
                        }${timelineStatusPostfix}`
                      )}
                        customChild={getTimelineCaptions(checkpoint)}
                      />
                    </React.Fragment>
                  );
                })}
            </ConnectingCheckPoints>
          )}
        </Fragment>
      )}
      {data && showNextActions(data?.nextActions)}
    </React.Fragment>
  );
};

export default PTRWFApplicationTimeline;
from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/reviewer",
    tags=["Reviewer"]
)


# ==========================================
# Request Models
# ==========================================

class ReviewActionRequest(BaseModel):
    patient_id: str
    action: str
    reviewer_note: str = ""


# ==========================================
# Reviewer Action
# ==========================================

@router.post("/action")
def reviewer_action(
    data: ReviewActionRequest
):

    allowed_actions = {
        "acknowledge",
        "request_clarification",
        "prepare_referral"
    }

    if data.action not in allowed_actions:
        return {
            "status": "error",
            "message": (
                "Invalid reviewer action."
            ),
            "allowed_actions": list(
                allowed_actions
            )
        }


    action_messages = {

        "acknowledge": (
            "Triage information acknowledged "
            "for professional review."
        ),

        "request_clarification": (
            "Additional patient information "
            "should be collected before final "
            "clinical assessment."
        ),

        "prepare_referral": (
            "Referral preparation information "
            "has been structured for review."
        )
    }


    return {

        "status": "success",

        "patient_id":
            data.patient_id,

        "action":
            data.action,

        "message":
            action_messages[
                data.action
            ],

        "reviewer_note":
            data.reviewer_note,

        "human_review":
            "Required",

        "disclaimer": (
            "This action only organizes "
            "workflow information. Final "
            "clinical decisions must be made "
            "by a qualified healthcare "
            "professional."
        )
    }


# ==========================================
# Referral Preparation
# ==========================================

@router.post("/referral")
def prepare_referral(
    data: ReviewActionRequest
):

    return {

        "status": "success",

        "referral": {

            "patient_id":
                data.patient_id,

            "reason":
                "Prepared from reported "
                "symptoms and available "
                "triage information.",

            "review_status":
                "Pending healthcare "
                "professional review",

            "reviewer_note":
                data.reviewer_note
        },

        "message": (
            "Referral preparation completed "
            "for professional review."
        ),

        "disclaimer": (
            "This is a referral-preparation "
            "prototype. It does not determine "
            "diagnosis, treatment or referral "
            "necessity automatically."
        )
    }
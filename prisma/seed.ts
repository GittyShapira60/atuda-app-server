import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function deleteRequestTypeAndRelatedData(requestTypeId: any) {
  const relatedRequests = await prisma.request.findMany({
    where: { requestTypeId: requestTypeId }
  });
  for (const request of relatedRequests) {
    await prisma.requestDetails.deleteMany({
      where: { requestId: request.id }
    });
  }
  await prisma.request.deleteMany({
    where: { requestTypeId: requestTypeId }
  });
  await prisma.requestType.delete({
    where: { id: requestTypeId }
  });
}

async function main() {
  const existRequestTypes = await prisma.requestType.findMany();

  const requestTypes = [
    {
      id: "09",
      name: "בקשה לחילופי סטודנטים",
      description:
        'עתודאים המעוניינים לצאת לחו"ל לטובת לימודים בתוכנית חילופי סטודנטים יפתחו בקשה זו. שימו לב שיש לבצע את תהליך הגשת הבקשה ולהמתין לאישור רשמי טרם קניית כרטיסי טיסה. כרטיסים שנקנו טרם אישור הבקשה לא יהוו עילה לאישור ולא יינתן החזר כספי.',
      duration: 30,
      declarationText:
        'הנני מצהיר שבמידה ואפסיד חומר לימודי בזמן השהייה בחו"ל  לא אוכל לבקש הארכת דח"ש כתוצאה מכך.',
      stagesFlow: {
        options: [
          "state&institution",
          "program",
          "reason",
          "attachingFiles_replacement"
        ],
        isDepend: false
      },
      reasonRequired: false,
      isAvailable: true
    },
    {
      id: "03",
      name: "בקשה לקיצור / הארכת דח”ש",
      description:
        "עתודאים המעוניינים לבקש הארכה או קיצור של דחיית השירות מעבר לתקופת הדח”ש הנוכחית יגישו בקשה זו",
      duration: 30,
      declarationText:
        "הנני מצהיר כי הפרטים שמסרתי נכונים ושידוע לי כי במידה ותאושר בקשתי, לא אהיה זכאי/ת למענק בתקופת הדח”ש הנוספת",
      stagesFlow: {
        options: [
          "selectEndDate_toggle",
          "reason",
          "attachingFiles_shortExtend"
        ],
        isDepend: false
      },
      reasonRequired: true,
      isAvailable: true
    },
    {
      id: "01",
      name: "בקשה לשינוי מסלול לימודים",
      description:
        "עתודאי/ת המעוניינים לשנות את המקצוע / אופי המסלול / מוסד הלימודים בו לומדים, יפתחו בקשה זו",
      duration: 30,
      declarationText: "הנני מצהיר כי הפרטים שמסרתי נכונים",
      stagesFlow: {
        options: [
          {
            name: "institution",
            displayName: "שינוי מוסד לימודים",
            stages: [
              "selectInstitution",
              "selectStartDate_dropdown",
              "selectEndDate_dropdown",
              "reason",
              "attachingFiles_changeStudy"
            ]
          },
          {
            name: "major",
            displayName: "שינוי במגמה ראשית / משנית",
            stages: [
              "selectMajor",
              "selectStartDate_dropdown",
              "selectEndDate_dropdown",
              "reason",
              "attachingFiles_changeStudy"
            ]
          },
          {
            name: "institution&major",
            displayName: "שינוי מגמה ראשית/משנית ומוסד לימודים",
            stages: [
              "selectInstitution",
              "selectMajor",
              "selectStartDate_dropdown",
              "selectEndDate_dropdown",
              "reason",
              "attachingFiles_changeStudy"
            ]
          }
        ],
        layout: "lines",
        menuTitle: "השינוי המבוקש",
        isDepend: true
      },
      reasonRequired: true,
      isAvailable: true
    },
    {
      id: "02",
      name: "בקשה לעזיבת מסלול העתודה האקדמית",
      description:
        "עתודאי/ת המעוניינים להפסיק את לימודיהם או שמוסד הלימודים הפסיק את לימודיהם, ימלאו בקשה זו",
      duration: 30,
      declarationText:
        "הנני מצהיר כי הפרטים שמסרתי נכונים ושידוע לי כי מתאריך אישור הפסקת לימודי אקבל צו/הודעה/שיחה טלפונית להתייצב פיזית לעזיבת מסלול במדור סטודנטים, ואם לא אתייצב, יפתח תהליך נפקדות נגדי. בנוסף ידוע לי כי אהיה מחויב בהחזר מלא של מענקי העתודה אותם קיבלתי במהלך לימודי",
      stagesFlow: {
        options: ["reasonLeaveStudy", "reason", "attachingFiles_leaveStudy"],
        isDepend: false
      },
      reasonRequired: true,
      isAvailable: true
    },
    {
      id: "06",
      name: "בקשה להקלה בחוב",
      description:
        "עתודאי/ת אשר עזבו את המסלול, ויש להם חוב על מענקים אשר קיבלו מעתודה אקדמית, ואשר מעוניינים בהקלה, יפתחו בקשה זו.",
      duration: 30,
      declarationText: "הנני מצהיר כי הפרטים שמסרתי נכונים",
      stagesFlow: {
        options: ["reason", "attachingFiles_debtRelief"],
        isDepend: false
      },
      reasonRequired: true,
      isAvailable: true,
      excludeReasons: ["academic"]
    },
    {
      id: "07",
      name: "בקשת הצטרפות למצטייני המאה",
      description:
        "עתודאי/ת אשר מעוניינים להגיש את מועמדותם למצטייני המאה - תוכנית לעתודאים בעלי ממוצע 90 ומעלה בשנת הלימודים הקודמת, מוזמנים להגיש מועמדות דרך בקשה זו.",
      duration: 30,
      declarationText: "הנני מצהיר כי הפרטים שמסרתי נכונים",
      stagesFlow: {
        options: ["reason", "attachingFiles_hundredOutstanding"],
        isDepend: false
      },
      reasonRequired: false,
      isAvailable: true
    },
    {
      id: "08",
      name: "בקשה לסמסטר קיץ",
      description:
        "עתודאים המעוניינים להירשם לסמסטר קיץ במוסד הלימודים בו לומדים יגישו בקשה זו. חל איסור להירשם/לבצע סמסטר קיץ ללא אישור מדור סטודנטים",
      duration: 30,
      declarationText:
        'הנני מצהיר/ה כי הפרטים שמסרתי נכונים. כמו כן, אני מצהיר כי אני מבין שאינני יכול להירשם לסמסטר קיץ ו/או להתחיל את לימודי סמסטר הקיץ עד לקבלת אישור רשמי לבקשה זו ממדור סטודנטים במנט"א',
      stagesFlow: {
        options: ["reason", "attachingFiles_summerSemester"],
        isDepend: false
      },
      reasonRequired: true,
      isAvailable: true
    },
    {
      id: "09",
      name: "בקשה לחילופי סטודנטים",
      description:
        'עתודאים המעוניינים לצאת לחו"ל לטובת לימודים בתוכנית חילופי סטודנטים יפתחו בקשה זו. שימו לב שיש לבצע את תהליך הגשת הבקשה ולהמתין לאישור רשמי טרם קניית כרטיסי טיסה. כרטיסים שנקנו טרם אישור הבקשה לא יהוו עילה לאישור ולא יינתן החזר כספי.',
      duration: 30,
      declarationText:
        'הנני מצהיר שבמידה ואפסיד חומר לימודי בזמן השהייה בחו"ל  לא אוכל לבקש הארכת דח"ש כתוצאה מכך.',
      stagesFlow: {
        options: [
          "state&institution",
          "program",
          "reason",
          "attachingFiles_replacement"
        ],
        isDepend: false
      },
      reasonRequired: false,
      isAvailable: true
    }
  ];

  for (const requestType of requestTypes) {
    await prisma.requestType.upsert({
      where: { id: requestType.id },
      update: requestType,
      create: requestType
    });
  }

  for (const existRequestType of existRequestTypes) {
    if (!requestTypes.some((rt) => rt.id === existRequestType.id)) {
      await deleteRequestTypeAndRelatedData(existRequestType.id);
    }
  }

  const existStages = await prisma.stage.findMany();

  const stages = [
    {
      key: "selectEndDate_toggle",
      header: "תאריך סיום לימודים מבוקש",
      title: "בחירת שנה ותאריך",
      description:
        "התאריך המבוקש יכול להיות בטווח של שנתיים מתאריך הסיום הנוכחי ובמועדים המצויינים בלבד",
      schema: {
        "type": "object",
        "required": ["requestType", "semestersNumber"],
        "properties": [
          {
            "requestType": {
              "type": "object",
              "title": "סוג הבקשה",
              "layout": {
                "props": {
                  "firstLabel": { name: "קיצור", id: "01" },
                  "secondLabel": { name: "הארכה", id: "02" }
                },
                "slots": {
                  "component": "toggle-button"
                }
              }
            }
          },
          {
            "semestersNumber": {
              "type": "string",
              "title": "כמות סמסטרים",
              "layout": {
                "props": {
                  "data": ["1", "2", "3", "4"]
                },
                "slots": {
                  "component": "radio-lines"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "reasonLeaveStudy",
      header: "סיבת העזיבה",
      title: "סיבת עזיבת המסלול",
      description: "יש לבחור את סיבת הפסקת הלימודים",
      schema: {
        "type": "object",
        "required": ["requestType"],
        "properties": [
          {
            "requestType": {
              "type": "object",
              "title": "סיבת עזיבת המסלול",
              "layout": {
                "props": {
                  "data": [
                    {
                      text: {
                        name: "מוסד הלימודים הפסיק את לימודי",
                        id: "01"
                      },
                      image: "institution"
                    },
                    {
                      text: { name: "אני רוצה להפסיק את לימודי", id: "02" },
                      image: "personally"
                    }
                  ]
                },
                "slots": {
                  "component": "radio-button"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "reason",
      header: "פירוט סיבת הבקשה",
      schema: {
        "type": "object",
        "required": ["description"],
        "properties": [
          {
            "description": {
              "type": "string",
              "title": "פרוט הפנייה",
              "pattern": "^[א-ת0-9 ()._:'\"?!,%@&₪#\n-]+$",
              "layout": {
                "props": {
                  "description":
                    "יש לפרט את סיבת הבקשה [חובה]. שימו לב! אין לציין שמות יחידות, תפקידים, תוכניות או כל נושא אחר שאינו ברמת סיווג בלמ”ס. יש להשתמש באותיות עבריות, ספרות ותווים נוספים.",
                  "maxLength": 1000,
                  "rows": 11
                },
                "slots": {
                  "component": "textarea"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_shortExtend",
      header: "צירוף קבצים",
      title: "",
      schema: {
        "type": "object",
        "required": ["02", "03"],
        "properties": [
          {
            "02": {
              "title": "גליון ציונים עדכני",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "title": "קבצים שחובה לצרף",
                  "types": "application/pdf,image/jpeg,image/png",
                  "size": 10485760,
                  "info": "גליון ציונים עדכני של כלל הסמסטרים, בקובץ PDF/תמונה."
                }
              }
            }
          },
          {
            "03": {
              "title": "תוכנית לימודים מעודכנת",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה",
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
                  "size": 10485760,
                  "info":
                    "תכנית לימודים בקובץ WORD/PDF/EXCEL/תמונה, מהסמסטר הנוכחי עד הסמסטר המבוקש כולל, בהנחה ויאושר. בתכנית יש לפרט את שמות הקורסים והנק''ז של כל אחד מהם."
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "title": "רפואי",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "title": "כלכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "education": {
              "key": "15",
              "title": "השכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "other": {
              "key": "15",
              "title": "אחר",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_replacement",
      header: "צירוף קבצים",
      title: "",
      schema: {
        "type": "object",
        "required": ["02", "21"],
        "properties": [
          {
            "02": {
              "title": "גליון ציונים עדכני",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה",
                  "types": "application/pdf,image/jpeg,image/png",
                  "size": 10485760,
                  "info": "גליון ציונים עדכני של כלל הסמסטרים, בקובץ PDF/תמונה."
                }
              }
            }
          },
          {
            "21": {
              "title": "אישור קבלה לתוכנית ממוסד הלימודים",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "title": "קבצים שחובה לצרף",
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
                  "size": 10485760,
                  "info":
                    "אישור קבלה לתוכנית ממוסד הלימודים, בקובץ PDF/WORD/תמונה."
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "title": "רפואי",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "title": "כלכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "education": {
              "key": "15",
              "title": "השכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "other": {
              "key": "15",
              "title": "אחר",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_changeStudy",
      header: "צירוף קבצים",
      schema: {
        "type": "object",
        "required": ["02", "14", "09"],
        "properties": [
          {
            "02": {
              "title": "גליון ציונים עדכני",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "types": "application/pdf,image/jpeg,image/png",
                  "size": 10485760,
                  "info": "גליון ציונים עדכני של כלל הסמסטרים, בקובץ PDF/תמונה."
                }
              }
            }
          },
          {
            "14": {
              "title": 'תוכנית לימודים ע"פ מגמה/מוסד חדש',
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "title": "קבצים שחובה לצרף",
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
                  "size": 10485760,
                  "info":
                    "תכנית לימודים של המסלול שרלוונטי לבקשה, בקובץ WORD/PDF/EXCEL/תמונה ."
                }
              }
            }
          },
          {
            "09": {
              "title": "מסמך קבלה רשמי ממוסד הלימודים",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה",
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info":
                    "מסמך קבלה ממוסד הלימודים שרלוונטי לשינוי המסלול, בקובץ PDF/תמונה."
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "title": "רפואי",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "title": "כלכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "education": {
              "key": "15",
              "title": "השכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "other": {
              "key": "15",
              "title": "אחר",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_leaveStudy",
      header: "צירוף קבצים",
      title: "",
      schema: {
        "type": "object",
        "required": ["02"],
        "properties": [
          {
            "02": {
              "title": "גליון ציונים עדכני",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "slots": {
                  "component": "file-input"
                },
                "props": {
                  "title": "קבצים שחובה לצרף",
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "types": "application/pdf,image/jpeg,image/png",
                  "size": 10485760,
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה",
                  "info": "גליון ציונים עדכני של כלל הסמסטרים בקובץ PDF/תמונה."
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "title": "רפואי",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "title": "כלכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "education": {
              "key": "15",
              "title": "השכלה",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          },
          {
            "other": {
              "key": "15",
              "title": "אחר",
              "type": "array",
              "items": {
                "type": "object"
              },
              "layout": {
                "props": {
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "size": 10485760,
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                },
                "cols": 6
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_debtRelief",
      header: "צירוף קבצים",
      schema: {
        "type": "object",
        "required": ["17", "18", "19"],
        "anyOf": [
          {
            "required": ["20", "05", "07", "04"]
          },
          {
            "required": ["06"]
          }
        ],
        "properties": [
          {
            "17": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "עובר ושב עתודאי",
              "layout": {
                "props": {
                  "info":
                    "עובר ושב של העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה.",
                  "size": 10485760,
                  "title":
                    'קבצים שחובה לצרף (במקרה של סיוע כלכלי מההורים, על העתודאי לצרף את קבצי החובה הקשורים להורים, אחרת יש לצרף אישור חתום סא"ל/נוטריון בגין אי תמיכה כלכלית)',
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "18": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "תלושי שכר עתודאי",
              "layout": {
                "props": {
                  "info":
                    "תלושי שכר של העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "19": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "פירוט אשראי עתודאי",
              "layout": {
                "props": {
                  "info":
                    "פירוט אשראי של העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "20": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "עובר ושב הורים",
              "layout": {
                "props": {
                  "info":
                    "עובר ושב של הורי העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "05": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "תלושי שכר הורים",
              "layout": {
                "props": {
                  "info":
                    "תלושי שכר של הורי העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "07": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "פירוט אשראי הורים",
              "layout": {
                "props": {
                  "info":
                    "פירוט אשראי של הורי העתודאי 3 חודשים אחרונים בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "04": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "ת.ז. וספח הורים",
              "layout": {
                "props": {
                  "info": "צילום של ת.ז. והספח של הורי העתודאי בקובץ PDF/תמונה",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "06": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "אישור חתום סא''ל/נוטריון",
              "layout": {
                "props": {
                  "info":
                    "אישור חתום של סא''ל או נוטריון בגין אי תמיכה כלכלית של הורי העתודאי בקובץ PDF/WORD/תמונה",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "רפואי",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "כלכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "education": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "השכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "other": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "אחר",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          }
        ],
        "dependencies": {
          "06": {
            "not": {
              "required": ["20", "05", "07", "04"]
            }
          },
          "20": ["05", "07", "04"],
          "05": ["20", "07", "04"],
          "07": ["20", "05", "04"],
          "04": ["20", "05", "07"]
        }
      }
    },
    {
      key: "attachingFiles_hundredOutstanding",
      header: "צירוף קבצים",
      schema: {
        "type": "object",
        "required": ["02", "10", "12"],
        "properties": [
          {
            "10": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "קורות חיים",
              "layout": {
                "props": {
                  "info": "קורות חיים של העתודאי, בקובץ PDF/תמונה.",
                  "size": 10485760,
                  "title": "קבצים שחובה לצרף",
                  "types": "application/pdf,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "12": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "המלצה מגורם אקדמי",
              "layout": {
                "props": {
                  "info": "המלצה מגורם אקדמי, בקובץ PDF/WORD/EXCEL/תמונה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "02": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "גליון ציונים עדכני",
              "layout": {
                "props": {
                  "info":
                    "גליון ציונים עדכני של כלל הסמסטרים, בקובץ PDF/תמונה.",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png",
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "רפואי",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "כלכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "education": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "השכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "other": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "אחר",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "attachingFiles_summerSemester",
      header: "צירוף קבצים",
      schema: {
        "type": "object",
        "required": ["02", "16"],
        "properties": [
          {
            "16": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "רשימת קורסים ומבחנים סמסטר קיץ",
              "layout": {
                "props": {
                  "info":
                    "רשימת קורסים ומבחנים סמסטר קיץ בקובץ PDF/תמונה/WORD.",
                  "size": 10485760,
                  "title": "קבצים שחובה לצרף",
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "02": {
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "גליון ציונים עדכני",
              "layout": {
                "props": {
                  "info":
                    "גליון ציונים עדכני של כלל הסמסטרים, בקובץ PDF/תמונה.",
                  "size": 10485760,
                  "types": "application/pdf,image/jpeg,image/png",
                  "titleFooter": "קבצים שלא חובה לצרף",
                  "subTitleFooter": "עד 5 קבצים בכל קטגוריה"
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "medicine": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "רפואי",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים רפואיים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "economy": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "כלכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי כלכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "education": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "השכלה",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצי השכלה שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          },
          {
            "other": {
              "key": "15",
              "type": "array",
              "items": {
                "type": "object"
              },
              "title": "אחר",
              "layout": {
                "cols": 6,
                "props": {
                  "info": "קבצים אחרים שרלוונטיים לבקשה.",
                  "size": 10485760,
                  "types":
                    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/tiff",
                  "maxItems": 5
                },
                "slots": {
                  "component": "file-input"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "selectInstitution",
      header: "מוסד לימודים מבוקש",
      schema: {
        "type": "object",
        "required": ["institution"],
        "properties": [
          {
            "institution": {
              "type": "object",
              "title": "מוסד לימודים מבוקש",
              "layout": {
                "props": {
                  "data": "${institutions}",
                  "description": "יש להקליד את מוסד הלימודים בו תרצו ללמוד"
                },
                "slots": {
                  "component": "select"
                }
              }
            }
          }
        ]
      }
    },

    {
      key: "state&institution",
      header: "המדינה והמוסד",
      title: "בחירת מדינה ומוסד לימודים",
      description: "",
      schema: {
        "type": "object",
        "required": ["state", "institution"],
        "properties": [
          {
            "state": {
              "type": "object",
              "title": "מדינה לחילופי סטודנטים",
              "layout": {
                "props": {
                  "data": "${countries}",
                  "description": "המדינה בה אבצע את חילופי הסטודנטים"
                },
                "slots": {
                  "component": "select"
                }
              }
            }
          },
          {
            "institution": {
              "type": "string",
              "title": "מוסד הלימודים בו אבצע את חילופי הסטודנטים",
              "pattern": "^[א-ת0-9 ()._:'\"?!,%@&₪#\n-]+$",
              "layout": {
                "props": {
                  "description": "",
                  "maxLength": 50,
                  "rows": 2
                },
                "slots": {
                  "component": "textarea"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "program",
      header: "פרטי התוכנית",
      title: "פרטי התוכנית",
      description: "",
      schema: {
        "type": "object",
        "required": ["programDuration", "programDates"],
        "properties": [
          {
            "programDuration": {
              "type": "string",
              "title": "משך התוכנית",
              "layout": {
                "props": {
                  "data": ["שני סמסטרים", "סמסטר אחד"]
                },
                "slots": {
                  "component": "radio-lines"
                }
              }
            }
          },
          {
            "programDates": {
              "type": "array",
              "title": "תאריכי התוכנית",
              "items": {
                "type": "string",
                "format": "date"
              },
              "minItems": 2,
              "maxItems": 2,
              "validation": {
                "minRangeMonths": 6,
                "maxRangeMonths": 12
              },
              "layout": {
                "props": {},
                "slots": {
                  "component": "date-range-picker"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "selectStartDate_dropdown",
      header: "תאריך תחילת לימודים מבוקש",
      title: "בחירת שנה ותאריך",
      description: "יש לבחור תאריך תחילת לימודים",
      schema: {
        "type": "object",
        "required": ["startYear", "startSemester"],
        "properties": [
          {
            "startYear": {
              "type": "string",
              "title": "תאריך תחילת לימודים",
              "layout": {
                "props": {
                  "title": "שנת לימודים אקדמית",
                  "subTitle": "בחירת השנה",
                  "data": "${2nextyears}"
                },
                "slots": {
                  "component": "dropdown"
                }
              }
            }
          },
          {
            "startSemester": {
              "type": "string",
              "title": "בחירת סמסטר ראשון",
              "layout": {
                "props": {
                  "data": ["חורף", "אביב"]
                },
                "slots": {
                  "component": "radio-lines"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "selectEndDate_dropdown",
      header: "תאריך סיום לימודים מבוקש",
      title: "בחירת שנה ותאריך",
      description: "יש לבחור תאריך סיום לימודים",
      schema: {
        "type": "object",
        "required": ["endYear", "endSemester"],
        "properties": [
          {
            "endYear": {
              "type": "string",
              "title": "תאריך סיום לימודים",
              "layout": {
                "props": {
                  "title": "שנת לימודים אקדמית",
                  "subTitle": "בחירת השנה",
                  "data": "${7nextyears}"
                },
                "slots": {
                  "component": "dropdown"
                }
              }
            }
          },
          {
            "endSemester": {
              "type": "string",
              "title": "בחירת סמסטר אחרון",
              "layout": {
                "props": {
                  "data": ["חורף", "אביב"]
                },
                "slots": {
                  "component": "radio-lines"
                }
              }
            }
          }
        ]
      }
    },
    {
      key: "selectMajor",
      header: "מגמה מבוקשת",
      schema: {
        "type": "object",
        "minProperties": 1,
        "required": [],
        "properties": [
          {
            "mainMajorType": {
              "type": "string",
              "title": "סוג מגמה",
              "layout": {
                "props": {
                  "description": "יש לבחור את המגמה בה תרצו ללמוד",
                  "data": ["מגמה ראשית"]
                },
                "slots": {
                  "component": "checkbox"
                }
              }
            }
          },
          {
            "mainMajorOption": {
              "type": "object",
              "title": "מגמה ראשית",
              "layout": {
                "props": {
                  "subTitle": "בחירת המגמה",
                  "title": "null",
                  "data": "${majors}"
                },
                "slots": {
                  "component": "dropdown"
                }
              }
            }
          },
          {
            "secondMajorType": {
              "type": "string",
              "title": "סוג מגמה",
              "layout": {
                "props": {
                  "description": "null",
                  "data": ["מגמה משנית"]
                },
                "slots": {
                  "component": "checkbox"
                }
              }
            }
          },
          {
            "secondMajorOption": {
              "type": "object",
              "title": "מגמה משנית",
              "layout": {
                "props": {
                  "title": "null",
                  "subTitle": "בחירת המגמה",
                  "data": "${majors}"
                },
                "slots": {
                  "component": "dropdown"
                }
              }
            }
          }
        ],
        "dependencies": {
          "mainMajorType": ["mainMajorOption"],
          "secondMajorType": ["secondMajorOption"],
          "mainMajorOption": ["mainMajorType"],
          "secondMajorOption": ["secondMajorType"]
        }
      }
    }
  ];

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { key: stage.key },
      update: stage,
      create: stage
    });
  }

  for (const existStage of existStages) {
    if (!stages.some((rt) => rt.key === existStage.key)) {
      await prisma.stage.delete({
        where: { key: existStage.key }
      });
    }
  }

  const majors = [
    { listName: "majors", id: "19000", name: "הנדסה כללית" },
    { listName: "majors", id: "19003", name: "הנדסת מכונות" },
    { listName: "majors", id: "19004", name: "הנדסת אווירונאוטיקה וחלל" },
    { listName: "majors", id: "19005", name: "הנדסת תעשייה וניהול" },
    { listName: "majors", id: "19008", name: "אדריכלות אקדמיה'" },
    { listName: "majors", id: "19009", name: "הנדסה כימית" },
    { listName: "majors", id: "19014", name: "הנדסת מיפוי וגיאו-אינפורמציה" },
    { listName: "majors", id: "19015", name: "הנדסת חומרים" },
    { listName: "majors", id: "19024", name: "מתמטיקה" },
    { listName: "majors", id: "19025", name: "פיזיקה" },
    { listName: "majors", id: "19026", name: "כימיה" },
    { listName: "majors", id: "19027", name: "ביולוגיה" },
    { listName: "majors", id: "19032", name: "הנדסת אלקטרואופטיקה - דיגמא" },
    { listName: "majors", id: "19033", name: "גיאולוגיה" },
    { listName: "majors", id: "19039", name: "מדעי החברה" },
    { listName: "majors", id: "19040", name: "כלכלה" },
    { listName: "majors", id: "19041", name: "סטטיסטיקה" },
    { listName: "majors", id: "19042", name: "חשבונאות וכלכלה" },
    { listName: "majors", id: "19043", name: "מנהל עסקים" },
    { listName: "majors", id: "19044", name: "פסיכולוגיה" },
    { listName: "majors", id: "19048", name: "יחסים בינלאומיים" },
    { listName: "majors", id: "19058", name: "גיאוגרפיה" },
    { listName: "majors", id: "19060", name: "מדעי המזרח התיכון" },
    { listName: "majors", id: "19061", name: "שפות" },
    { listName: "majors", id: "19065", name: "משאבי אנוש" },
    { listName: "majors", id: "19070", name: "הנדסת מערכות מידע" },
    { listName: "majors", id: "19072", name: "משפטים" },
    { listName: "majors", id: "19078", name: "רוקחות" },
    { listName: "majors", id: "19089", name: "סיעוד" },
    { listName: "majors", id: "19092", name: "אימון גופני" },
    {
      listName: "majors",
      id: "19096",
      name: "גיאופיזיקה ומדעי האטמוספירה והחלל"
    },
    { listName: "majors", id: "19104", name: 'רפואת חירום(ב"א)' },
    { listName: "majors", id: "19111", name: "הנדסת ביוטכנולוגיה ומזון" },
    { listName: "majors", id: "19115", name: "מדעי מעבדה רפואי" },
    { listName: "majors", id: "19164", name: "הנדסת חשמל" },
    { listName: "majors", id: "19188", name: "הנדסה ביו רפואית" },
    { listName: "majors", id: "19201", name: "לוגיסטיקה" },
    { listName: "majors", id: "19357", name: "פיזיוטרפיה" },
    { listName: "majors", id: "19472", name: "הוראה" },
    { listName: "majors", id: "19516", name: "ניהול מערכות מידע" },
    {
      listName: "majors",
      id: "19530",
      name: "הנדסת חומרים פולימריים (הנדסה פלסטית)"
    },
    { listName: "majors", id: "19543", name: "טכ' למע' למידה" },
    { listName: "majors", id: "20175", name: "הנדסת מכונות - ברקים - עילית" },
    {
      listName: "majors",
      id: "20176",
      name: "הנדסת חשמל ופיזיקה - פסגות - עילית"
    },
    { listName: "majors", id: "20177", name: "הנדסת תוכנה - פסגות - עילית" },
    { listName: "majors", id: "20250", name: "הנדסת נתונים ומידע" },
    {
      listName: "majors",
      id: "20275",
      name: "הנדסת אווירונאוטיקה - סילון - עילית"
    },
    { listName: "majors", id: "20350", name: "הנדסת נתונים - אלונים - עילית" },
    { listName: "majors", id: "20375", name: "מערכות אוטונומיות ורובוטיקה" },
    { listName: "majors", id: "20425", name: "הנדסת חומרים - גבישים - עילית" },
    { listName: "majors", id: "20476", name: "הנדסה אזרחית ובניין" },
    { listName: "majors", id: "20500", name: "מדעי המזון" },
    { listName: "majors", id: "20575", name: "ארזים - מתמטיקה ומדעי המחשב" },
    { listName: "majors", id: "20625", name: "הוראת מתמטיקה" },
    { listName: "majors", id: "20626", name: "הוראת אנגלית" },
    { listName: "majors", id: "20627", name: "הוראת פיסיקה" },
    { listName: "majors", id: "21100", name: "ביולוגיה חישובית - ביו - עילית" },
    { listName: "majors", id: "21125", name: "טכנולוגיות דיגיטליות ברפואה" },
    {
      listName: "majors",
      id: "21177",
      name: "הנדסת חשמל ואלקטרוניקה במסלול אפסילון"
    },
    {
      listName: "majors",
      id: "21178",
      name: "הנדסת מערכות תקשורת במסלול אפסילון"
    },
    { listName: "majors", id: "21179", name: "ניהול משאבי אנוש 2.5 שנתי" },
    { listName: "majors", id: "21276", name: "הנדסת חשמל - רעמים - עילית" },
    { listName: "majors", id: "21300", name: "ענבר - הנדסת חשמל ואלקטרוניקה" },
    { listName: "majors", id: "21301", name: "דרך צלחה - הנדסת תעשייה וניהול" },
    {
      listName: "majors",
      id: "21351",
      name: "הנדסת מכונות ופיזיקה - ברקים - עילית"
    },
    {
      listName: "majors",
      id: "21352",
      name: "הנדסת תעשייה וניהול - אביבים - עילית"
    },
    {
      listName: "majors",
      id: "21375",
      name: "הנדסת חשמל ומדעי המחשב - רום - עילית"
    },
    { listName: "majors", id: "21376", name: "הנדסת תוכנה - אמירים" },
    { listName: "majors", id: "21425", name: "מתמטיקה - ארזים 2" },
    { listName: "majors", id: "21426", name: "הנדסת נתונים ומידע – ברקת" },
    { listName: "majors", id: "21427", name: "הנדסת חשמל ואלקטרוניקה – גלים" },
    { listName: "majors", id: "21525", name: "פיסיקה – גלקסיה – עילית" },
    { listName: "majors", id: "21552", name: "הנדסת תעשייה וניהול – אריאל" },
    { listName: "majors", id: "21575", name: "הנדסת חשמל ואלקטרוניקה - דיגמא" },
    { listName: "majors", id: "21576", name: "מדעי המחשב- אמירים" },
    { listName: "majors", id: "21577", name: "רפואת שיניים - בינה - עילית" },
    { listName: "majors", id: "21578", name: "רפואה כללית - צמרת - עילית" },
    { listName: "majors", id: "21579", name: "ניהול מערכות מידע - אמירים" },
    { listName: "majors", id: "21580", name: "הנדסת מחשבים - דיגמא" },
    { listName: "majors", id: "21581", name: "הנדסת מערכות תקשורת - דיגמא" },
    { listName: "majors", id: "21601", name: "מרום – הנדסת מערכת" }
  ];

  const institutions = [
    { listName: "institutions", id: "1013", name: "אילת מכללת אילת" },
    { listName: "institutions", id: "106", name: "מוסד אזרחי" },
    { listName: "institutions", id: "1064", name: "מרכז אקדמי אור יהודה" },
    { listName: "institutions", id: "1148", name: "עמק חפר ק חינוך בן גוריו" },
    { listName: "institutions", id: "1540", name: "מכללת BPM: סניף חיפה" },
    { listName: "institutions", id: "1542", name: "מכללת ורצברגר" },
    { listName: "institutions", id: "1543", name: "ארטי - מכללת רמת גן" },
    {
      listName: "institutions",
      id: "180",
      name: "האקדמיה למוסיקה ולמחול בירושלים"
    },
    { listName: "institutions", id: "183", name: "המרכז האקדמי לב" },
    {
      listName: "institutions",
      id: "184",
      name: "מכללה אקדמית לחינוך–אורות ישראל רחובות"
    },
    {
      listName: "institutions",
      id: "186",
      name: "מכללה אקדמית לחינוך–אורות ישראל אלקנה"
    },
    {
      listName: "institutions",
      id: "187",
      name: "תלפיות - המכללה האקדמית לחינוך"
    },
    { listName: "institutions", id: "188", name: "המכללה הטכנולוגית באר שבע" },
    {
      listName: "institutions",
      id: "189",
      name: "המכללה למינהל אשדוד - שלוחת אילת"
    },
    { listName: "institutions", id: "190", name: "הנדסאים באריאל" },
    {
      listName: "institutions",
      id: "191",
      name: "הנדסאים תל אביב - שלוחת ירושלים"
    },
    {
      listName: "institutions",
      id: "192",
      name: "לב הגליל - מכללה לתחבורה רכב"
    },
    {
      listName: "institutions",
      id: "193",
      name: "מכללת סח'נין- שלוחת באקה אל גרביה"
    },
    { listName: "institutions", id: "194", name: "מכללת סח'נין- שלוחת נצרת" },
    { listName: "institutions", id: "2021", name: "נתניה-וינגייט אקדמאי" },
    { listName: "institutions", id: "2023", name: "ים-מכללת אורט ג.רם אקדמא" },
    { listName: "institutions", id: "203", name: 'ב"ש מכללה טכנולוגית' },
    { listName: "institutions", id: "2035", name: "י-ם מכללה אקדמית להנדסה" },
    {
      listName: "institutions",
      id: "2043",
      name: 'סמי‌נר אופקים - מכללת‌ ב"ש'
    },
    { listName: "institutions", id: "3384", name: "ים-מכללת ירושלים" },
    { listName: "institutions", id: "3803", name: "צמח מכללת עמק הירדן" },
    { listName: "institutions", id: "3910", name: 'ת"א יפו המכללה האקדמאית' },
    { listName: "institutions", id: "4064", name: "מכ' אפקה" },
    { listName: "institutions", id: "4065", name: 'אריאל מכללה אקדמאית נ"ש' },
    { listName: "institutions", id: "4066", name: "מכ' סמי שמעון ב\"ש" },
    { listName: "institutions", id: "4067", name: 'ת"א מס אקדמי מכ למנהל' },
    { listName: "institutions", id: "4069", name: "קרית אונו קריה אקדמית" },
    { listName: "institutions", id: "4074", name: "מפרץ חיפה מכללת עתיד" },
    { listName: "institutions", id: "4077", name: 'ראשל"צ מכללת אפיק' },
    { listName: "institutions", id: "473", name: 'ב"ש מכללת סמי שמעון' },
    { listName: "institutions", id: "476", name: "י-ם מכללת הדסה" },
    { listName: "institutions", id: "480", name: "מכללת תל חי" },
    { listName: "institutions", id: "489", name: "מרכז אקדמי ועיצוב וחינוך" },
    { listName: "institutions", id: "4909", name: "מכללת פרס" },
    { listName: "institutions", id: "5001", name: "י-ם אונ' עברית למודי חוץ" },
    { listName: "institutions", id: "5002", name: 'ת"א אוני\' ת"א לימוד חוץ' },
    { listName: "institutions", id: "5003", name: "ב\"ש אוניב' הנגב למוד חוץ" },
    { listName: "institutions", id: "5004", name: "ר\"ג אונ' בר אילן למוד חו" },
    { listName: "institutions", id: "5005", name: "חיפה הטכניון לימוד חוץ" },
    { listName: "institutions", id: "5006", name: "חיפה אונ' חיפה למודי חוץ" },
    { listName: "institutions", id: "5007", name: "מכללת רופין" },
    { listName: "institutions", id: "5010", name: "אונ' אריאל" },
    { listName: "institutions", id: "5011", name: 'גבים-מכללת הנגב ע"ש ספיר' },
    { listName: "institutions", id: "5012", name: "חדרה-מכללת מנשה" },
    { listName: "institutions", id: "5013", name: "אשקלון-מכללת אשקלון" },
    { listName: "institutions", id: "5014", name: "עכו-מכללת הגליל המערבי" },
    { listName: "institutions", id: "5015", name: "צפת-מכללת צפת" },
    { listName: "institutions", id: "509", name: "מרכז חרדי להכשרה מקצועית" },
    { listName: "institutions", id: "5100", name: "אקד כרמאל מכ אורט בראודה" },
    { listName: "institutions", id: "5101", name: "מכללה לאופטומטריה בישראל" },
    { listName: "institutions", id: "5102", name: 'י"ם מכללת הדסה' },
    { listName: "institutions", id: "5103", name: 'ת"א - המכללה לבטוח' },
    { listName: "institutions", id: "5105", name: "מכ עמק יזרעאל" },
    { listName: "institutions", id: "5106", name: "נתניה - המכללה האקדמית" },
    {
      listName: "institutions",
      id: "5107",
      name: "אוניברסיטת רייכמן בינתחומי הרצליה"
    },
    { listName: "institutions", id: "5108", name: 'ת"א - המכללה להנדסה' },
    { listName: "institutions", id: "5109", name: 'מכללה לחנוך ע"ש דוד ילין' },
    { listName: "institutions", id: "5110", name: "מכללה לחנוך עש אד גורדון" },
    { listName: "institutions", id: "5111", name: "מכללת תלפיות" },
    { listName: "institutions", id: "5112", name: "אורנים ביס לחינוך של תקם" },
    { listName: "institutions", id: "5113", name: 'ב"ש - מכללת קיי' },
    { listName: "institutions", id: "5114", name: "חיפה - מכללה ערבית לחנוך" },
    { listName: "institutions", id: "5115", name: "ים מכללה למורים עש לפשיץ" },
    { listName: "institutions", id: "5116", name: "מכללת אחווה" },
    { listName: "institutions", id: "5117", name: "מכללת אפרתה" },
    { listName: "institutions", id: "5119", name: "ברטון הול קולג אנגליה" },
    { listName: "institutions", id: "5120", name: "אונ אלבמה בירמינגהם" },
    { listName: "institutions", id: "5121", name: "אונ פוליטכנ ניויורק ארהב" },
    { listName: "institutions", id: "5122", name: "לסלי קולג ארהב" },
    { listName: "institutions", id: "5123", name: "אונ לטביה" },
    { listName: "institutions", id: "5124", name: "אונ סנדרלנד אנגליה" },
    { listName: "institutions", id: "5125", name: "אונ ברונל קולגהנלי לנהול" },
    { listName: "institutions", id: "5126", name: "אונ יוניסה דראפ" },
    { listName: "institutions", id: "5127", name: "אונ לסטר אנגליה" },
    { listName: "institutions", id: "5128", name: "אונ בוסטון ארהב" },
    { listName: "institutions", id: "5130", name: "אונ קלארק ארהב" },
    { listName: "institutions", id: "5131", name: "אונ פוליטכניק קליפורניה" },
    { listName: "institutions", id: "5132", name: "אונ דרבי אנגליה" },
    { listName: "institutions", id: "5135", name: "אונ בדפורד אנגליה" },
    { listName: "institutions", id: "5136", name: "טורו קולג ארהב" },
    { listName: "institutions", id: "5137", name: "כרמיאל מכללת אורט בראודה" },
    { listName: "institutions", id: "5138", name: "מכללת המברסייד" },
    { listName: "institutions", id: "5139", name: "מכללת יוזמות (ץ.צ.פ)" },
    { listName: "institutions", id: "5140", name: 'ראשל"צ מכללה למנהל' },
    { listName: "institutions", id: "5142", name: "אורנים מכללה" },
    { listName: "institutions", id: "5144", name: "הוד השרון שערי משפט" },
    { listName: "institutions", id: "5145", name: 'ר"ג-שנקר מכללה לטכסטיל' },
    { listName: "institutions", id: "5623", name: "המכללה האקדמית לישראל" },
    { listName: "institutions", id: "5624", name: "מכללת סכנין-הכש' ע.הוראה" },
    { listName: "institutions", id: "5625", name: "המרכז האקדמי שלם" },
    { listName: "institutions", id: "5626", name: "המכללה האקד' לחברה ואומנ" },
    { listName: "institutions", id: "5627", name: "המרכז האקדמי ויצו" },
    { listName: "institutions", id: "5628", name: "מכללה אקדמית לחינוך" },
    { listName: "institutions", id: "565", name: "מכון טכנולוגי חולון" },
    { listName: "institutions", id: "580", name: "מכללת MBC" },
    { listName: "institutions", id: "6544", name: "קצרין מכללת אוהלו" },
    { listName: "institutions", id: "7538", name: "מכללה טכנולוגית תל חי" },
    { listName: "institutions", id: "8016", name: "קרית אונו הקריה האקדמית" },
    { listName: "institutions", id: "8022", name: "חיפה שאנן-המכ'דתית לחנוך" },
    { listName: "institutions", id: "8184", name: "א.יהודה מרכז לימוד אקדמ'" },
    { listName: "institutions", id: "8200", name: 'המכללה האקדמית ת"א- יפו' },
    { listName: "institutions", id: "8201", name: "ים אקדמיה למוסיקה ומחול" },
    { listName: "institutions", id: "8202", name: "המכללה האקדמית פרס" },
    { listName: "institutions", id: "8203", name: "מוסד אקדמי למשפט ועסקים" },
    { listName: "institutions", id: "8206", name: "קרית אונו - מכללת צילום" },
    { listName: "institutions", id: "8208", name: "מכללת אתגר בירושלים" },
    { listName: "institutions", id: "8209", name: "אורט קריית ביאליק" },
    { listName: "institutions", id: "8210", name: "תא-מכללת אורט סינגלובסקי" },
    { listName: "institutions", id: "8220", name: 'אפקה - ת"א' },
    { listName: "institutions", id: "8222", name: "המרכז האקדמי כרמל" },
    { listName: "institutions", id: "8225", name: "המוסד ללימודים אקדמאיים" },
    { listName: "institutions", id: "8227", name: "מכון לנדר מרכז אקדמי י-ם" },
    { listName: "institutions", id: "8228", name: "המכללה האקדמית כנרת" },
    { listName: "institutions", id: "8232", name: "סמינר הקיבוצים-אקדמאי-תא" },
    { listName: "institutions", id: "8234", name: "מכללה אקד' לחינוך-אורנים" },
    { listName: "institutions", id: "8235", name: "מורשת יעקב מכ אקד דת חנך" },
    { listName: "institutions", id: "8236", name: "המכללה האקדמית בית-ברל" },
    { listName: "institutions", id: "8238", name: "מכללת סמי שמעון אשדוד" },
    { listName: "institutions", id: "8239", name: "מכללה לחינוך חמדת הדרום" },
    { listName: "institutions", id: "8240", name: "מכללת עתיד מעלות" },
    { listName: "institutions", id: "8241", name: 'מכללת עתיד ת"א' },
    { listName: "institutions", id: "8242", name: "מכללת עתיד באר שבע" },
    { listName: "institutions", id: "8243", name: "מכללת עתיד אום אל פחם" },
    { listName: "institutions", id: "8245", name: "מכללת עתיד כרמיאל" },
    { listName: "institutions", id: "831", name: 'ת"א מכללה למנהל' },
    { listName: "institutions", id: "840", name: 'ת"א סמינר לוינסקי' },
    { listName: "institutions", id: "855", name: 'ת"א הנדסאים אוני\' ת"א' },
    { listName: "institutions", id: "856", name: "המרכז האקדמי לב" },
    { listName: "institutions", id: "8770", name: "מללכת אתגר" },
    { listName: "institutions", id: "8771", name: "מכון טכנולוגי חולון" },
    { listName: "institutions", id: "880", name: 'ר"ג שנקר מכללה לטכסטיל' },
    { listName: "institutions", id: "881", name: "י-ם אוניברסיטה עברית" },
    { listName: "institutions", id: "882", name: "אונ' ת\"א" },
    { listName: "institutions", id: "883", name: 'אוניברסיטת בן גוריון ב"ש' },
    { listName: "institutions", id: "884", name: 'ר"ג אוניברסיטת בר אילן' },
    { listName: "institutions", id: "885", name: "חיפה הטכניון" },
    { listName: "institutions", id: "886", name: "חיפה אוניברסיטת חיפה" },
    { listName: "institutions", id: "8863", name: "נתניה מכללת הרמלין להנדס" },
    { listName: "institutions", id: "887", name: "י-ם אקדמיה למוסיקה" },
    { listName: "institutions", id: "888", name: "מוסד אקדמאי לא מוכר בארץ" },
    { listName: "institutions", id: "889", name: 'מוסד אקדמאי בחו"ל' },
    { listName: "institutions", id: "890", name: "רחובות מכון ויצמן" },
    { listName: "institutions", id: "892", name: 'ת"א האקדמיה למוסיקה' },
    { listName: "institutions", id: "893", name: "י-ם בצלאל" },
    { listName: "institutions", id: "894", name: "ביהס גבוה לטכנולוגיה י-ם" },
    { listName: "institutions", id: "896", name: "אוניברסיטה פתוחה" },
    { listName: "institutions", id: "9000", name: "בדיקה" },
    { listName: "institutions", id: "9001", name: 'ק חנוך אורט רחובו ב"ס טכ' },
    { listName: "institutions", id: "9003", name: "המכללה למנהל בחיפה" },
    { listName: "institutions", id: "9004", name: "המכללה למנהל- אשדוד" },
    { listName: "institutions", id: "9005", name: "מכללת נצרת עילית" },
    { listName: "institutions", id: "9006", name: "המכללה כנרת בעמק הירדן" },
    { listName: "institutions", id: "9007", name: "הקריה ללימודי הנדסה וטכנ" },
    { listName: "institutions", id: "9008", name: "מרכז אקדמי דן" },
    { listName: "institutions", id: "9009", name: "פרקליטות צבאית ראשית" },
    { listName: "institutions", id: "9010", name: "מכללת הרצוג" },
    { listName: "institutions", id: "9011", name: "מכללה ירושלים" },
    {
      listName: "institutions",
      id: "9027",
      name: "המכללה האקדמית לחינוך - קי"
    },
    { listName: "institutions", id: "9028", name: "מכללת רמת גן" },
    { listName: "institutions", id: "9046", name: "מכללת אתגר" }
  ];

  const countries = [
    { listName: "countries", id: "AD", name: "אנדורה" },
    { listName: "countries", id: "AG", name: "אנטיגואה וברבודה" },
    { listName: "countries", id: "AI", name: "אנגווילה" },
    { listName: "countries", id: "AM", name: "ארמניה" },
    { listName: "countries", id: "AN", name: "איי האנטילים ההולנדיים" },
    { listName: "countries", id: "AO", name: "אנגולה" },
    { listName: "countries", id: "AR", name: "ארגנטינה" },
    { listName: "countries", id: "AS", name: "סמואה האמריקאית" },
    { listName: "countries", id: "AT", name: "אוסטריה" },
    { listName: "countries", id: "AU", name: "אוסטרליה" },
    { listName: "countries", id: "BB", name: "ברבדוס" },
    { listName: "countries", id: "BD", name: "בנגלדש" },
    { listName: "countries", id: "BE", name: "בלגיה" },
    { listName: "countries", id: "BF", name: "בורקינה פאסו" },
    { listName: "countries", id: "BG", name: "בולגריה" },
    { listName: "countries", id: "BI", name: "בורונדי" },
    { listName: "countries", id: "BM", name: "ברמודה" },
    { listName: "countries", id: "BO", name: "בוליביה" },
    { listName: "countries", id: "BR", name: "ברזיל" },
    { listName: "countries", id: "BS", name: "בהאמאס" },
    { listName: "countries", id: "BT", name: "בהוטן" },
    { listName: "countries", id: "BW", name: "בוטסואנה" },
    { listName: "countries", id: "BZ", name: "בליז" },
    { listName: "countries", id: "CA", name: "קנדה" },
    { listName: "countries", id: "CD", name: "הרפובליקה הדמוקרטית של קונגו" },
    { listName: "countries", id: "CF", name: "הרפובליקה המרכז אפריקאית" },
    { listName: "countries", id: "CG", name: "הרפובליקה של קונגו" },
    { listName: "countries", id: "CH", name: "שווייץ" },
    { listName: "countries", id: "CK", name: "איי קוק" },
    { listName: "countries", id: "CL", name: "צ'ילה" },
    { listName: "countries", id: "CN", name: "סין" },
    { listName: "countries", id: "CO", name: "קולומביה" },
    { listName: "countries", id: "CR", name: "קוסטה ריקה" },
    { listName: "countries", id: "CU", name: "קובה" },
    { listName: "countries", id: "CV", name: "כף ורדה" },
    { listName: "countries", id: "CY", name: "קפריסין" },
    { listName: "countries", id: "CZ", name: "צ'כיה" },
    { listName: "countries", id: "DE", name: "גרמניה" },
    { listName: "countries", id: "DK", name: "דנמרק" },
    { listName: "countries", id: "DM", name: "דומיניקה" },
    { listName: "countries", id: "DO", name: "הרפובליקה הדומיניקנית" },
    { listName: "countries", id: "DZ", name: "אלג'יריה" },
    { listName: "countries", id: "EC", name: "אקוודור" },
    { listName: "countries", id: "EE", name: "אסטוניה" },
    { listName: "countries", id: "ES", name: "ספרד" },
    { listName: "countries", id: "ET", name: "אתיופיה" },
    { listName: "countries", id: "FI", name: "פינלנד" },
    { listName: "countries", id: "FJ", name: "פיג'י" },
    { listName: "countries", id: "FK", name: "איי פוקלנד" },
    { listName: "countries", id: "FM", name: "מיקרונזיה" },
    { listName: "countries", id: "FO", name: "איי פארו" },
    { listName: "countries", id: "FR", name: "צרפת" },
    { listName: "countries", id: "GA", name: "גבון" },
    { listName: "countries", id: "GB", name: "בריטניה" },
    { listName: "countries", id: "GD", name: "גרנדה" },
    { listName: "countries", id: "GE", name: "גאורגיה" },
    { listName: "countries", id: "GF", name: "גויאנה הצרפתית" },
    { listName: "countries", id: "GH", name: "גאנה" },
    { listName: "countries", id: "GI", name: "גיברלטר" },
    { listName: "countries", id: "GL", name: "גרינלנד" },
    { listName: "countries", id: "GM", name: "גמביה" },
    { listName: "countries", id: "GN", name: "גינאה" },
    { listName: "countries", id: "GQ", name: "גינאה המשוונית" },
    { listName: "countries", id: "GR", name: "יוון" },
    { listName: "countries", id: "GT", name: "גואטמלה" },
    { listName: "countries", id: "GU", name: "גואם" },
    { listName: "countries", id: "GW", name: "גינאה-ביסאו" },
    { listName: "countries", id: "GY", name: "גיאנה" },
    { listName: "countries", id: "HK", name: "הונג קונג" },
    { listName: "countries", id: "HN", name: "הונדורס" },
    { listName: "countries", id: "HR", name: "קרואטיה" },
    { listName: "countries", id: "HT", name: "האיטי" },
    { listName: "countries", id: "HU", name: "הונגריה" },
    { listName: "countries", id: "IE", name: "אירלנד" },
    { listName: "countries", id: "IL", name: "ישראל" },
    { listName: "countries", id: "IN", name: "הודו" },
    {
      listName: "countries",
      id: "IO",
      name: "טריטוריית האוקיינוס ההודי בריטית"
    },
    { listName: "countries", id: "IS", name: "איסלנד" },
    { listName: "countries", id: "IT", name: "איטליה" },
    { listName: "countries", id: "JM", name: "ג'מייקה" },
    { listName: "countries", id: "JP", name: "יפן" },
    { listName: "countries", id: "JW", name: "איווה" },
    { listName: "countries", id: "KH", name: "קמבודיה" },
    { listName: "countries", id: "KI", name: "קיריבטי" },
    { listName: "countries", id: "KM", name: "קומורוס" },
    { listName: "countries", id: "KR", name: "דרום קוריאה" },
    { listName: "countries", id: "KY", name: "איי קיימן" },
    { listName: "countries", id: "LA", name: "לאוס" },
    { listName: "countries", id: "LC", name: "סנט לוסיה" },
    { listName: "countries", id: "LI", name: "ליכטנשטיין" },
    { listName: "countries", id: "LK", name: "סרי לנקה" },
    { listName: "countries", id: "LR", name: "ליבריה" },
    { listName: "countries", id: "LS", name: "לסוטו" },
    { listName: "countries", id: "LT", name: "ליטא" },
    { listName: "countries", id: "LU", name: "לוקסמבורג" },
    { listName: "countries", id: "LV", name: "לטביה" },
    { listName: "countries", id: "MC", name: "מונקו" },
    { listName: "countries", id: "MD", name: "מולדובה" },
    { listName: "countries", id: "MG", name: "מדגסקר" },
    { listName: "countries", id: "MH", name: "איי מרשל" },
    { listName: "countries", id: "MK", name: "מקדוניה" },
    { listName: "countries", id: "MM", name: "מיאנמר" },
    { listName: "countries", id: "MN", name: "מונגוליה" },
    { listName: "countries", id: "MO", name: "מקאו" },
    { listName: "countries", id: "MON", name: "הרפובליקה המונגולית" },
    { listName: "countries", id: "MQ", name: "מרטיניק" },
    { listName: "countries", id: "MS", name: "מונסרט" },
    { listName: "countries", id: "MT", name: "מלטה" },
    { listName: "countries", id: "MU", name: "מאוריציוס" },
    { listName: "countries", id: "MV", name: "האיים המלדיביים" },
    { listName: "countries", id: "MW", name: "מלאווי" },
    { listName: "countries", id: "MX", name: "מקסיקו" },
    { listName: "countries", id: "MY", name: "מלזיה" },
    { listName: "countries", id: "MZ", name: "מוזמביק" },
    { listName: "countries", id: "NA", name: "נמיביה" },
    { listName: "countries", id: "NC", name: "קלדוניה החדשה" },
    { listName: "countries", id: "NF", name: "אי נורפוק" },
    { listName: "countries", id: "NG", name: "ניגריה" },
    { listName: "countries", id: "NI", name: "ניקרגואה" },
    { listName: "countries", id: "NL", name: "הולנד" },
    { listName: "countries", id: "NO", name: "נורווגיה" },
    { listName: "countries", id: "NP", name: "נפאל" },
    { listName: "countries", id: "NR", name: "נאורו" },
    { listName: "countries", id: "NZ", name: "ניו זילנד" },
    { listName: "countries", id: "PA", name: "פנמה" },
    { listName: "countries", id: "PE", name: "פרו" },
    { listName: "countries", id: "PF", name: "פולינזיה הצרפתית" },
    { listName: "countries", id: "PG", name: "פפואה גינאה החדשה" },
    { listName: "countries", id: "PH", name: "פיליפינים" },
    { listName: "countries", id: "PL", name: "פולין" },
    { listName: "countries", id: "PM", name: "סנט פייר ומיקלון" },
    { listName: "countries", id: "PR", name: "פוארטו ריקו" },
    { listName: "countries", id: "PT", name: "פורטוגל" },
    { listName: "countries", id: "PY", name: "פרגוואי" },
    { listName: "countries", id: "QA", name: "קטאר" },
    { listName: "countries", id: "RO", name: "רומניה" },
    { listName: "countries", id: "RU", name: "רוסיה" },
    { listName: "countries", id: "RW", name: "רואנדה" },
    { listName: "countries", id: "SB", name: "איי שלמה" },
    { listName: "countries", id: "SC", name: "איי סיישל" },
    { listName: "countries", id: "SE", name: "שוודיה" },
    { listName: "countries", id: "SER", name: "סרביה" },
    { listName: "countries", id: "SG", name: "סינגפור" },
    { listName: "countries", id: "SH", name: "סנט הלנה" },
    { listName: "countries", id: "SI", name: "סלובניה" },
    { listName: "countries", id: "SK", name: "סלובקיה" },
    { listName: "countries", id: "SM", name: "סן-מארינו" },
    { listName: "countries", id: "SR", name: "סורינם" },
    { listName: "countries", id: "SV", name: "אל סלבדור" },
    { listName: "countries", id: "SZ", name: "סוואזילנד" },
    { listName: "countries", id: "TC", name: "איי טורקס ויקוס" },
    { listName: "countries", id: "TH", name: "תאילנד" },
    { listName: "countries", id: "TJ", name: "טג'יקיסטן" },
    { listName: "countries", id: "TO", name: "טונגה" },
    { listName: "countries", id: "TP", name: "טימור המזרחית" },
    { listName: "countries", id: "TT", name: "טרינידד וטובגו" },
    { listName: "countries", id: "TV", name: "טובלו" },
    { listName: "countries", id: "TW", name: "טיוואן" },
    { listName: "countries", id: "TZ", name: "טנזניה" },
    { listName: "countries", id: "US", name: "ארצות הברית" },
    { listName: "countries", id: "UY", name: "אורוגוואי" },
    { listName: "countries", id: "VA", name: "קריית הוותיקן" },
    { listName: "countries", id: "VC", name: "סנט וינסנט והגרנדינים" },
    { listName: "countries", id: "VE", name: "ונצואלה" },
    { listName: "countries", id: "VG", name: "איי הבתולה הבריטיים" },
    { listName: "countries", id: "VI", name: "איי הבתולה האמריקאיים" },
    { listName: "countries", id: "VN", name: "וייטנאם" },
    { listName: "countries", id: "VU", name: "ונואטו" },
    { listName: "countries", id: "WS", name: "סמואה" },
    { listName: "countries", id: "YE", name: "תימן" },
    { listName: "countries", id: "ZA", name: "דרום אפריקה" },
    { listName: "countries", id: "ZM", name: "זמביה" },
    { listName: "countries", id: "ZR", name: "זאיר" },
    { listName: "countries", id: "ZW", name: "זימבבואה" }
  ];

  const allItems = [...majors, ...institutions, ...countries];

  for (const item of allItems) {
    await prisma.selectItem.upsert({
      where: { name_listName: { name: item.name, listName: item.listName } },
      update: {},
      create: item
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

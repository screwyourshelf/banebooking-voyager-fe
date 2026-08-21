import {
  ContentDocument,
  ContentDocumentFacts,
  ContentDocumentIntro,
  ContentDocumentSection,
} from "@/components/layout/ContentDocument";

const Document = Object.assign(ContentDocument, {
  Intro: ContentDocumentIntro,
  Section: ContentDocumentSection,
  Facts: ContentDocumentFacts,
});

export default Document;

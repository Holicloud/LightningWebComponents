import { getByDataId, flushPromises } from "test/utils";
import RECORDS from "./data/records.json";
const DEFAULT_RECORDS = RECORDS.slice(0, 5);

const inputSearchTerm = async (element, searchTerm) => {
  // Sets input search term and force input change
  const searchInput = getByDataId(element, "input");
  searchInput.focus();
  searchInput.value = searchTerm;
  searchInput.dispatchEvent(new CustomEvent("input"));
  // Disable search throttling
  jest.runOnlyPendingTimers();
  await flushPromises();
};

const searchHandler = jest.fn(() => {
  return RECORDS;
});

const selectionHandler = jest.fn(({ selectedIds }) => {
  return RECORDS.filter((record) => selectedIds.includes(record.id));
});

function assertListBoxIsVisible(element, recordsToValidate) {
  expect(recordsToValidate?.length).toBeGreaterThan(0);

  if (typeof recordsToValidate[0] === "object") {
    recordsToValidate = recordsToValidate.map((record) => record.id);
  }

  const otherRecords = RECORDS.filter(
    (record) => !recordsToValidate.includes(record.id)
  );
  for (const record of otherRecords) {
    const containerEl = element.shadowRoot.querySelector(
      `[data-record-id="${record.id}"]`
    );
    expect(containerEl).toBeFalsy();
  }

  for (const recordId of recordsToValidate) {
    const record = RECORDS.find((rec) => rec.id === recordId);

    expect(record).toBeTruthy();

    const containerEl = element.shadowRoot.querySelector(
      `[data-record-id="${recordId}"]`
    );
    expect(containerEl).toBeTruthy();

    const titleEl = containerEl.querySelector('[data-id="title"]');
    expect(titleEl.value).toBe(record.title);

    if (record.subtitles?.length) {
      record.subtitles.forEach(function (subtitle, index) {
        const subtitleContainer =
          containerEl.querySelectorAll(`[data-id="subtitle"]`)[index];
        const subtitleLabelEl = subtitleContainer.querySelector(
          `[data-id="subtitle-label"]`
        );
        expect(subtitleLabelEl).toBeTruthy();
        expect(subtitleLabelEl.value).toBe(subtitle.subtitleLabel);

        const subtitleValueEl = subtitleContainer.querySelector(
          `[data-id="subtitle-value"]`
        );
        expect(subtitleValueEl).toBeTruthy();
      });
    }
  }
}

function assertDropdownIsVisible(element) {
  expect(getByDataId(element, "dropdown")?.classList).toContain("slds-is-open");
}

function assertDropdownIsNotVisible(element) {
  expect(getByDataId(element, "dropdown")?.classList).not.toContain(
    "slds-is-open"
  );
}

export {
  inputSearchTerm,
  searchHandler,
  selectionHandler,
  DEFAULT_RECORDS,
  assertListBoxIsVisible,
  assertDropdownIsVisible,
  assertDropdownIsNotVisible
};

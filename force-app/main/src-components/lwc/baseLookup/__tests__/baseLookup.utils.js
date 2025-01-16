import { flushPromises, getByDataId } from "test/utils";

export const inputSearchTerm = async (element, searchTerm) => {
  // Sets input search term and force input change
  const searchInput = getByDataId(element, "input");
  searchInput.focus();
  searchInput.value = searchTerm;
  searchInput.dispatchEvent(new CustomEvent("input"));
  // Disable search throttling
  jest.runAllTimers();
  await flushPromises();
};

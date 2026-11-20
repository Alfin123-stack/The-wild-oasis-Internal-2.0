"use client";

/* eslint-disable react/prop-types */
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useQueryParams } from "../hooks/useQueryParams";
import styled from "styled-components";
import { PAGE_SIZE } from "../utils/constant";

const StyledPagination = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem 2rem;
  flex-wrap: wrap;

  @media (max-width: 599.98px) {
    flex-direction: column-reverse;
    align-items: stretch;
    text-align: center;
  }
`;

const P = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);

  & span {
    font-weight: 600;
    color: var(--color-grey-800);
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.8rem;

  @media (max-width: 599.98px) {
    & > button { flex: 1; }
  }
`;

const PaginationButton = styled.button`
  background-color: var(--color-grey-0);
  color: var(--color-grey-800);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-buttons);
  font-weight: 500;
  font-size: 1.3rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: var(--control-h);
  padding: 0 1.2rem;

  &:has(span:last-child) {
    padding-left: 0.8rem;
  }

  &:has(span:first-child) {
    padding-right: 0.8rem;
  }

  & svg {
    height: 1.6rem;
    width: 1.6rem;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-grey-100);
  }

  &:disabled {
    opacity: 0.45;
  }
`;

function Pagination({ count }) {
  const { searchParams, setParams } = useQueryParams();
  const currentPage = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const pageCount = Math.ceil(count / PAGE_SIZE);

  function handleNextPage() {
    setParams({ page: currentPage === pageCount ? currentPage : currentPage + 1 });
  }
  function handlePreviousPage() {
    setParams({ page: currentPage === 1 ? currentPage : currentPage - 1 });
  }

  if (pageCount <= 1) return null;

  return (
    <StyledPagination>
      <P>
        Showing <span>{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
        <span>{currentPage === pageCount ? count : currentPage * PAGE_SIZE}</span> of{" "}
        <span>{count}</span> results
      </P>

      <Buttons>
        <PaginationButton disabled={currentPage === 1} onClick={handlePreviousPage}>
          <HiChevronLeft />
          <span>Previous</span>
        </PaginationButton>
        <PaginationButton disabled={currentPage === pageCount} onClick={handleNextPage}>
          <span>Next</span>
          <HiChevronRight />
        </PaginationButton>
      </Buttons>
    </StyledPagination>
  );
}

export default Pagination;

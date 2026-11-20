"use client";

/* eslint-disable react/prop-types */
import { createContext, useContext } from "react";
import styled, { css } from "styled-components";

/*
 * Tabel responsif berbasis CONTAINER query (bukan lebar viewport): tabel yang ditaruh di kolom
 * sempit pun ikut berubah. Di bawah CARD_AT, tiap baris menjadi kartu:
 *   - header kolom disembunyikan
 *   - sel diposisikan lewat `areas` (grid-template-areas) pada <Table.Row areas="...">
 *   - sel diberi data-area="nama" (+ data-end untuk rata kanan, data-label="Teks" untuk caption kecil)
 * Di atas CARD_AT tampil sebagai tabel biasa dengan kolom `columns`.
 */
const CARD_AT = "68rem";
const card = (rules) => css`
  @container table (max-width: ${CARD_AT}) {
    ${rules}
  }
`;

const StyledTable = styled.div`
  container: table / inline-size;
  border: 1px solid var(--color-grey-200);
  font-size: var(--text-body);
  background-color: var(--color-grey-0);
  border-radius: var(--radius-cards);
  box-shadow: var(--shadow-subtle);
  overflow-x: auto;
`;

const CommonRow = styled.div`
  display: grid;
  text-align: left;
  grid-template-columns: ${(props) => props.$columns};
  column-gap: 2.4rem;
  align-items: center;
  min-width: ${CARD_AT};
  transition: none;
`;

const StyledHeader = styled(CommonRow)`
  padding: 1.2rem 2rem;
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-grey-500);

  ${card(css`
    display: none;
  `)}
`;

function areaNames(areas) {
  return [...new Set(String(areas || "").replace(/["']/g, " ").split(/\s+/).filter((n) => n && n !== "."))];
}

const StyledRow = styled(CommonRow)`
  padding: var(--row-pad-y) 2rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }

  &:hover {
    background-color: var(--color-grey-50);
  }

  ${(p) =>
    card(css`
      min-width: 0;
      grid-template-columns: ${p.$cardColumns || "minmax(0, 1fr) auto"};
      ${p.$areas ? `grid-template-areas: ${p.$areas};` : ""}
      gap: 0.8rem 1.2rem;
      align-items: center;
      padding: 1.4rem 1.6rem;

      & > * { min-width: 0; }
      ${areaNames(p.$areas)
        .map((n) => `& > [data-area="${n}"] { grid-area: ${n}; }`)
        .join("\n")}
      & > [data-end] { justify-self: end; text-align: right; }

      & [data-label]::before {
        content: attr(data-label);
        display: block;
        font-family: var(--font-sans);
        font-size: var(--text-caption);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-grey-500);
        margin-bottom: 0.2rem;
      }
    `)}
`;

const StyledBody = styled.section.attrs({ className: "enter-list" })``;

const Footer = styled.footer`
  position: sticky;
  left: 0;
  background-color: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: center;
  padding: 1.2rem 2rem;

  &:not(:has(*)) {
    display: none;
  }

  ${card(css`
    padding: 1.2rem 1.6rem;
  `)}
`;

const Empty = styled.p`
  font-family: var(--font-serif);
  font-size: 1.6rem;
  color: var(--color-grey-500);
  text-align: center;
  margin: 3.2rem;
`;

const TableContext = createContext();

function Table({ columns, children }) {
  return (
    <TableContext.Provider value={{ columns: columns }}>
      <StyledTable>{children}</StyledTable>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns } = useContext(TableContext);
  return <StyledHeader $columns={columns}>{children}</StyledHeader>;
}

// areas: grid-template-areas untuk mode kartu, mis. '"guest menu" "stay status"'
// cardColumns: kolom mode kartu (default: isi 1fr + aksi auto)
function Row({ children, areas, cardColumns }) {
  const { columns } = useContext(TableContext);
  return (
    <StyledRow $columns={columns} $areas={areas} $cardColumns={cardColumns}>
      {children}
    </StyledRow>
  );
}

function Body({ data, render }) {
  if (!data.length) return <Empty>No data to show.</Empty>;
  return <StyledBody>{data.map(render)}</StyledBody>;
}

Table.Header = Header;
Table.Row = Row;
Table.Body = Body;
Table.Footer = Footer;

export default Table;

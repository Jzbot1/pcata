import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5; // adjust this based on your preference

  const getStartPage = () => {
    const halfMaxVisible = Math.floor(maxVisiblePages / 2);
    if (totalPages <= maxVisiblePages) {
      return 1;
    }
    if (currentPage <= halfMaxVisible + 1) {
      return 1;
    }
    if (currentPage >= totalPages - halfMaxVisible) {
      return totalPages - maxVisiblePages + 1;
    }
    return currentPage - halfMaxVisible;
  };

  const getEndPage = (startPage) => {
    if (totalPages <= maxVisiblePages) {
      return totalPages;
    }
    return startPage + maxVisiblePages - 1;
  };

  const startPage = getStartPage();
  const endPage = getEndPage(startPage);

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 && "disabled"}`}>
          <button
            className="page-link"
            style={{ color: "#26bd68", backgroundColor: "transparent" }}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
        </li>
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, index) => startPage + index
        ).map((page) => (
          <li
            className={`page-item  ${currentPage === page && "active"}`}
            key={page}
          >
            <button
              className="page-link"
              style={{
                backgroundColor:
                  currentPage === page ? "#26bd68" : "transparent",
                color: currentPage === page ? "#fff" : "#26bd68",
                outlineColor: "#26bd68", // Add this line for custom outline color
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
          <button
            className="page-link"
            style={{ color: "#26bd68", backgroundColor: "transparent" }}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;

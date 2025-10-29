package com.larose.dto.search;

public abstract class SearchDto {
    private int pageIndex = 0;
    private int pageSize = 10;

    public void setPageIndex(Integer pageIndex) {
        if (pageIndex != null && pageIndex > 0) {
            this.pageIndex = pageIndex;
        }

    }

    public void setPageSize(Integer pageSize) {
        if (pageSize != null && pageSize > 0) {
            this.pageSize = pageSize;
        }

    }

    public void setPageIndexAndPageSize(Integer pageIndex, Integer pageSize) {
        this.setPageIndex(pageIndex);
        this.setPageSize(pageSize);
    }

    public int getOffset() {
        return (this.pageIndex - 1) * this.pageSize;
    }

    public void setPageIndexAndPageSizeToExport() {
        this.pageIndex = 1;
        this.pageSize = 1000000;
    }
    public int getPageIndex() {
        return this.pageIndex;
    }

    public int getPageSize() {
        return this.pageSize;
    }

    public SearchDto() {
    }
}

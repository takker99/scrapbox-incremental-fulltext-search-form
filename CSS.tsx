/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/** @jsx h */

import { h } from "./deps/preact.tsx";

export const CSS = () => (
  <style>
    {`

.modal {
  position:fixed;
  inset:0;
  z-index:1050;
  
  background-color:#000c;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
  padding: 10px;
}
.closed {
  display: none;
}
.modal > * {
  color: var(--page-text-color, #4a4a4a);
  background-color: var(--page-bg, #fefefe);
  border: 2px solid var(--body-bg, #dcdde0);
  border-radius: 4px;

  padding: 5px;
  width: calc(var(--item-width, 100%) - 10px);
}
@media (min-width: 768px) {
  .modal {
    padding: 30px;
  }
}

.controller {
  display: flex;
  gap: 0.2em;
}
[type="text"] {
  width: 100%;
}

.result {
  flex-direction: column;
  width: 100%;
  padding: 5px 0;
  margin: 2px 0 0;
  list-style: none;
  font-size: 14px;
  font-weight: normal;
  line-height: 28px;
  text-align: left;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 4px;
  background-clip: padding-box;
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: auto;
}
.candidates:not([data-os*="android"]):not([data-os*="ios"]) {
  font-size:11px;

}
.projects {
  margin-right: 4px;
  display: grid;
  grid-template-rows: repeat(4, min-content);
  grid-auto-flow: column;
  direction: rtl;
}
.projects:is([data-os*="android"], [data-os*="ios"]) > * {
  padding: 6px;
}

.candidates > :not(:first-child) {
  border-top: 1px solid var(--select-suggest-border-color, #eee);
}
.candidates > *{
  line-height: 1.2em;
  padding: 0.5em 10px;
}

.candidate {
  display: flex;
}

a {
  display: block;
  padding: 3px 20px;
  clear: both;
  align-items: center;
  font-weight: normal;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-decoration: none;
  text-overflow: ellipsis;
  color: inherit;
}
.description {
  margin-top: 0.5em;
  color: var(--incremental-fulltext-search-description-text-color, gray);
  font-size: 12px;
  line-height: 14px;
  max-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
}


`}
  </style>
);

/** @jsxImportSource npm:preact@10 */
export const CSS = () => (
  <style>
    {`.modal {
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
  flex-direction: column;
}
input {
  border-radius: 5px;
  padding: 0 10px;
  height: 32px;
  border: transparent;
  box-shadow: none;
  color: var(--search-form-text-color, rgba(255, 255, 255, 0.35));
  background-color: var(--search-form-bg, rgba(255, 255, 255, 0.15))
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

a {
  display: block;
  padding: 3px 20px;
  clear: both;
  align-items: center;
  user-select: none;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
}
.description {
  margin-top: 0.5em;
  color: var(--incremental-fulltext-search-description-text-color, #c4c4c4);
  font-size: 12px;
  line-height: 14px;
  max-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.description strong {
  background-color: #ff0;
  color: #666;
}

.spinner::before {
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  content: "\f110";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  animation: fa-spin 2s linear infinite;
}`}
  </style>
);

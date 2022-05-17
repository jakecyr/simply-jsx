export const List = ({ items }) => {
  const onClickItem = () => {
    items.push('item ' + items.length + 1);
  };

  return (
    <ul>
      {items.map((item, index) => (
        <li onClick={() => onClickItem()} key={index}>
          {item}
        </li>
      ))}
    </ul>
  );
};

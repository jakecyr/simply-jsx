import { List } from './list';

const MyDocument = ({ test }) => (
  <div className='container'>
    <h1>{test}</h1>
    <p>This is a paragraph.</p>
    <p>This is another paragraph.</p>
    <List items={['Item 1', 'Item 2', 'Item 3']} />
  </div>
);

JSXApp('app').bootstrap(<MyDocument test='test' />);

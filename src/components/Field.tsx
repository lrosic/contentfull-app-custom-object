import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  EditorToolbarButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  SelectField,
  Option,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
  id: string;
  key: string;
  value: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
 */
function createItem(): Item {
  return {
    id: uuid(),
    key: '',
    value: '',
  };
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
  const { valueName = 'Value' } = props.sdk.parameters.instance as any;
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // This ensures our app has enough space to render
    props.sdk.window.startAutoResizer();

    // Every time we change the value on the field, we update internal state
    props.sdk.field.onValueChanged((value: Item[]) => {
      if (Array.isArray(value)) {
        setItems(value);
      }
    });
  });

  /** Adds another item to the list */
  const addNewItem = () => {
    props.sdk.field.setValue([...items, createItem()]);
  };

  /** Creates an `onChange` handler for an item based on its `property`
   * @returns A function which takes an `onChange` event
   */
  const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (e: ChangeEvent<any>) => {
    const itemList = items.concat();
    const index = itemList.findIndex((i) => i.id === item.id);

    itemList.splice(index, 1, { ...item, [property]: e.target.value });

    props.sdk.field.setValue(itemList);
  };

  /** Deletes an item from the list */
  const deleteItem = (item: Item) => {
    props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
  };

  return (
      <div>
        <Table>
          <TableBody>
            {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                        id="key"
                        name="key"
                        labelText="Key"
                        value={item.key}
                        onChange={createOnChangeHandler(item, 'key')}
                    />
                  </TableCell>
                  <TableCell>
                    {Object.keys(props.sdk.parameters.instance).length > 0 ? (
                        <SelectField
                            onChange={createOnChangeHandler(item, 'value')}
                            labelText="Options"
                            name="optionSelect"
                            id="optionSelect"
                        >
                          <Option value="" disabled selected>
                            Select an option...
                          </Option>
                          {Object.keys(props.sdk.parameters.instance).map((param) => {
                            if (param.toLowerCase() === 'options') {
                              const options: string[] = (props.sdk.parameters.instance as any)[param].split('|');
                              return options.map((option) => {
                                return <Option value={option}>{option}</Option>;
                              });
                            }
                            return '';
                          })}
                        </SelectField>
                    ) : (
                        <TextField
                            id="value"
                            name="value"
                            labelText={valueName}
                            value={item.value}
                            onChange={createOnChangeHandler(item, 'value')}
                        />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <EditorToolbarButton label="delete" icon="Delete" onClick={() => deleteItem(item)} />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button buttonType="naked" onClick={addNewItem} icon="PlusCircle" style={{ marginTop: tokens.spacingS }}>
          Add Item
        </Button>
      </div>
  );
};

export default Field;

import { FieldSet } from 'airtable';

export interface Velden extends FieldSet {
	// _table: Table;
	// id: string;
	// _rawJson: RawJSON;
	// fields: Fields;
	_table: any;
	id: string;
	_rawJson: any;
	fields: any;
}

export interface RawJSON {
	id: string;
	fields: Fields;
	createdTime: string;
}

export interface Fields {
	Name: string;
	Message: string;
	Picture?: Picture[];
	Show: boolean;
}

export interface Picture {
	id: string;
	width: number;
	height: number;
	url: string;
	filename: string;
	size: number;
	type: Type;
	thumbnails: Thumbnails;
}

export interface Thumbnails {
	small: ImageSize;
	large: ImageSize;
	full: ImageSize;
}

export interface ImageSize {
	url: string;
	width: number;
	height: number;
}

export enum Type {
	ImageJPEG = 'image/jpeg',
}

export interface Table {
	_base: Base;
	id: null;
	name: string;
}

export interface Base {
	_airtable: {};
	_id: string;
}

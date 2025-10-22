/* eslint-disable @typescript-eslint/no-explicit-any */
export type LabelObjType = {
  id: number;
  name: string;
  type: number;
  color: string;
};

export type MemberObjType = {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  image?: string; // For backward compatibility
  role?: string; // Optional để backward compatibility
  joinedAt?: string;
  lastActive?: string;
  boards?: number;
  tasks?: number;
};

export type CheckedListObjType = {
  id: number;
  title: string;
  checked?: boolean; // For backward compatibility
};

export type AttachmentObjType = {
  id: number;
  file: {
    path: string;
    name: string;
    lastModified: number;
    lastModifiedDate: string;
    size?: number; // For backward compatibility
  };
  preview: string;
};

export type CardObjType = {
  id: number;
  title: string;
  attachments: AttachmentObjType[];
  label: LabelObjType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any;
  comments: any[];
  desc: string;
  members: MemberObjType[];
  checkedList: CheckedListObjType[];
  laneId?: number; // Added for react-trello compatibility
};

export type CardListObjType = {
  id: number;
  name: string;
  cards: CardObjType[];
};

export type BoardObjType = {
  id: number;
  name: string;
  list: CardListObjType[];
  description?: string; // For backward compatibility
  color?: string; // For backward compatibility
  members?: MemberObjType[]; // For backward compatibility
};

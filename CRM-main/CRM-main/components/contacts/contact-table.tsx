'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Contact } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContactDialog } from './contact-dialog';
import { useCRMStore } from '@/lib/store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ContactTableProps {
  contacts: Contact[];
}

export function ContactTable({ contacts }: ContactTableProps) {
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteContactAction = useCRMStore((state) => state.deleteContact);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteContact) return;

    setIsDeleting(true);
    try {
      await deleteContactAction(deleteContact.id);
      toast({
        title: 'Success',
        description: `Contact ${deleteContact.first_name} ${deleteContact.last_name} has been deleted.`,
      });
      setDeleteContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (contacts.length === 0) {
    return (
      <>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center py-12">
                    <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No contacts found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Get started by adding your first contact.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {editContact && (
          <ContactDialog
            open={!!editContact}
            onOpenChange={(open) => !open && setEditContact(null)}
            contact={editContact}
          />
        )}

        <AlertDialog open={!!deleteContact} onOpenChange={(open) => !open && setDeleteContact(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Contact</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deleteContact?.first_name} {deleteContact?.last_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Link 
                    href={`/contacts/${contact.id}`} 
                    className="flex items-center gap-3 hover:underline transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contact.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {getInitials(contact.first_name, contact.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  {contact.email ? (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.phone ? (
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.company ? (
                    <div>
                      <div className="font-medium">{contact.company.name}</div>
                      {contact.company.industry && (
                        <div className="text-xs text-muted-foreground">{contact.company.industry}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{contact.position || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditContact(contact)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteContact(contact)} 
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editContact && (
        <ContactDialog
          open={!!editContact}
          onOpenChange={(open) => !open && setEditContact(null)}
          contact={editContact}
        />
      )}

      <AlertDialog open={!!deleteContact} onOpenChange={(open) => !open && setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteContact?.first_name} {deleteContact?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
